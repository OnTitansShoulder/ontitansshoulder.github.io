---
layout: note_page
title: Begin to Advanced Splunk IV
title_short: splunk_notes_advanced
dateStr: 2020-01-01
category: Tool
tags: notes reference check
---

## Splunk 7 Advanced Searching and Reporting

This course focuses on advanced search and reporting commands to create robust searches, reports, and charts. Major topics include optimizing searches, additional charting commands and functions, formatting and calculating results, correlating events, and using combined searches and subsearches.

<br/>

### Module 1 Intro

Review contents in previous courses.

<br/>

### Module 2 Splunk Architecture

Searches that are run frequently or scheduled timely are the primary candidates for optimization. Also consider optimizing searches that query a large volume of data. The goal is to work with the smallest set of event data possible.

Splunk store data in indexes which held data in groups of data buckets.

Data are stored in Hot buckets as they arrive, then warn buckets and finally cold buckets. Eventually they go to frozen buckets for deletion or archiving.

**Inside Buckets** each bucket contains:

- a journal.gz file, where Splunk stores raw event data, composed of many smaller and compressed slices (each about 128 kb)
- time-series index (.tsidx) files, serves as index keys to the journal file
  - Splunk uses this to know which slice to open up and search for events
  - created from raw events, where each line is tokenized with the token words written out to a lexicon which exists inside _each_ tsidx file
  - and each lexicon has a posting array which has the location of the events in the journal file

**Bloom Filters** is created based on tsidx files when a bucket roll over from Hot to Warm

- it is a data structure for quick elimination of data that doesn't match a search
  - allows Splunk to avoid reading from disk unless really necessary
- when creating a Bloom Filter, each term inside a bucket's tsidx files' lexicon is run through a hashing algorithm
  - resulting hash sets the bits in the Bloom filter to 0/1
  - When a search is run, it generates its own Bloom filter based on the search terms and compared with the buckets' Bloom Filters, resulting a fast filter out unrelevant buckets

**Inside a Search**
- i.e. `index=security failed user=root | timechart count span=1h | stats avg(count) as HourlyAverage`
  - Splunk extracts 'failed' and 'root' and creates a Bloom Filter from them
  - Splunk then identify buckets in `security` index for the past 24h
  - Splunk compares the search Bloom Filter with those from the buckets
  - Splunk rules out tsidx files that don't have matches
  - Splunk checks the tsidx files from the selected buckets for extracted terms
  - Splunk uses the terms to go through each posting list to obtain seek address in journal file for raw events
  - Splunk extracts search-time fields from the raw events
  - Splunk filters the events that contains our search terms 'failed' and 'root'
  - The remaining events are search results
- In the search's Job Inspector
  - command.search.index gives the time to get location info from tsidx files
  - command.search.rawdata tells the time to extract event data from the gzip journal files
  - command.search.kv tells the time took to perform search-time field extractions
  - command.search.filter shows the time took to filter out non-matching events

**Transforming vs. Streaming Commands**

- transforming commands operate on the entire result set of data
  - need to wait for full set of results
  - executed on the Search Head
  - change event data into results once its complete
  - example commands _stats timechart chart top rara_
- streaming commands has two types
  - centralized
    - aka "Stateful Streaming Commands"
    - executed on the Search Head
    - apply transformations to each event returned by a search
    - results order depends on the order the data came in
    - example commands _transaction streamstats_
  - distributable
    - can execute without waiting for the full set of data
    - order of events does not matter
    - can be executed on Search Head or different Indexers
    - example commands _rename eval fields regex_
    - If preceded by commands that have to run on a Search Head, all will run on a Search Head
- http://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Commandsbytype

**Examples**

- i.e. `index=security failed user=root | timechart count span=1h | stats avg(count) as HourlyAverage`
  - _timechart_ and _stats_ are both transforming commands
  - data arrives to the Search Head then executes these commands
- i.e. `index=network sourcetype=cisco_wsa_squid | eval Risk = case(x_wbrs_score >= 3, "1 Safe", x_wbrs_score >= 0, "3 Neutral", x_wbrs_score >= -5, "4 Dangerous", 1==1, "Unknown") | timechart count by Risk`
  - _eval_ is executed on the Indexers and results send back to Search Head
- i.e. `index=network sourcetype=cisco_wsa_squid usage="Personal" OR usage="Violation" | stats count as connections by suspect, usage | rename username as suspect`
  - _rename_ here has to run on the Search Head, since _stats_ is a non-streaming transforming command
  - optimization: move _rename_ up before _stats_, so that it can execute on the Indexers

<br/>

### Module 3 Search Tuning

**Breakers and Segmentation**

- Segmentation: the process of tokenizing search terms at search-time. Two stages:
  - splitting events up by finding characters (major/minor breakers)
  - major breakers are used to isolate words, phrases, terms, and numerical data
    - example major breakers: _spaces newlines carriage_returns tabs brackets exclamation_points commas_
  - minor breakers go through results in the first pass and break them up further
    - example minor breakers: _forward_slashes colons periods hyphens dollar_signs_
- The goal is to quickly return a set of tokens
- The tokens become part of tsidx files lexicons at index-time and used to build bloom filters
- https://docs.splunk.com/Documentation/Splunk/latest/Data/Abouteventsegmentation

**Lispy Expressions**

- in a search's Job Inspector, you can access the _search.log_
- find the phrase "base lispy" in the _search.log_
  - this contains the Lispy Expression Splunk created from the search query
  - is used to build Bloom Filter and locate terms in tsidx files
  - i.e. `index=web clientip=76.169.7.252` yields Lispy: `[ AND 169 252 7 76 index::web ]`
- Lispy in Searches
  - in previous example, search of IP address breaks down the ip into four tokens, which can affect performance by letting Splunk return all events containing any of those numbers instead of just the IP address
  - phrases can also create an issue if they include a space (a major breaker)
    - i.e. `index=security "failed password"` yields Lispy: `[ AND failed index::web password ]`
    - will return events contain either 'failed' or 'password'
- To compensate the issue above for Lispy Expression, use the **TERM Directive** to specify a search term as a complete value
  - i.e. `index=web clientip=TERM(76.169.7.252)`
  - it by passes any minor breakers in the TERM argument
    - TERM's argument **MUST** be bound by major breakers in the raw events for events to be returned
    - i.e. this won't get returned: `index=cdn upload=TERM(image.gif)` for raw event `12/May/2019:09:42:36, Upload:'http//BCG.com/image.gif',User:'angrybird@k.net'`
    - TERM's argument must **NOT** include any major breakers
    - i.e. `index=games action=TERM("Got caught making fun")` is not indexed as a token and TERM has no effect here
  - You can use TERM to match key value pairs before field extraction
    - i.e. `index=games TERM(EventType=8)`
    - Note that TERM will not work with field aliases; if working heavily with CIM, i.e. `index=network sourcetype=cisco_wsa_squid src_ip=TERM(192.168.1.1)` can be replaced with `index=network sourcetype=cisco_wsa_squid TERM(192.168.1.1) src_ip=192.168.1.1`
- Negation in Lispy
  - i.e. `index=security NOT password` yields Lispy `[ AND index::security [ NOT password ] ]`
  - negating terms that including minor breakers is not helpful
    - i.e. `index=web NOT 192.168.1.1` yields Lispy `[ AND index::web ]`
    - This is a good place to use the TERM directive
- Wildcards and Lispy
  - wildcard in the middle is okay if the term doesn't include major/minor breakers; otherwise might cause in inconsistent search results
    - the fix is to not let wildcard consume the major/minor breaker in the term by including it: `slid*do` vs. `slid*.do`
    - still avoid wildcard in the middle of a term
  - wildcard in the end of the term is acceptable
  - wildcard at the beginning of a term will not create tokens
- Restrict search to use unique values and specific terms as much as possible
- using fields extracted at index-time early in the search would be very effective in creating efficient searches
- when searching for fields that are extracted at search-time, only the values are tokenized in Lispy and only if the '=' operator is used
  - others like '!=', '>', '<' will not tokenize field values
  - because these operators do not tell Splunk what exactly we are looking for
- Lookups and Lispy
  - values matches in a lookup are automatically added to the Lispy Expression

<br/>

### Module 4 Subsearch

**Subsearch** is a search that passes its results to its outer search as search terms

- enclosed in brackets
- must start with generating commands, such as _search tstats_
- always executed first before passing results to the outer search
- i.e. `index=security sourcetype=linux_secure "accepted" [search index=security sourcetype=linux_secure "failed password" src_ip!=10.0.0.0/8 | stats count by src_ip | where count > 10 | fields src_ip] | dedup src_ip, user | table src_ip, user`
  - when the results of the subsearch returns, Splunk implicitly adds "OR" between each two results
  - then the whole results is combined with the outter search with an "AND" operator;
    - can be override with "NOT" before the subsearch
  - multiple fields can be returned from the subsearch, better use _fields table return_ to limit the fields returned
- the **return command** should be used within subsearches
  - it formats results from a search into a single result and places into a new field "search", `| return src_ip`
  - by default, returns the first value unless a number of results is specified: `| return 5 src_ip`
  - concatenate the values with "OR": `(src_ip="xxx.xxx.xxx.xxx") OR (src_ip=...) OR ...` the field name is included by default; can omit it with '$' `| return 5 $src_ip`
  - can also alias the field name: `| return 5 ip=src_ip`
- i.e. `index=sales sourcetype=vendor_sales [ search index=sales sourcetype=vendor_sales VendorID<=2000 product_name=Mediocre* | top limit=5 Vendor | return 5 Vendor ] | rare limit=1 product_name by Vendor | fields - percent, count`

**Subsearch: When to use**

- Limitations of subsearches
  - default time limit of 60 seconds to execute
    - right after time limit, result is finalized and returned to outer search
  - default returns up to 10000 results
    - once met the cap, result is finalized and returned to outer search
  - limits can be adjusted by Admin
- Subsearch should operate on a small set of data and produces a small set of results
- If the outter search is executed **real-time**, its subsearch is executed for **all-time**
  - can override the all-time with _earliest_ and _latest_ time modifiers in subsearch
- only use subsearch when there is no other way to achieve the same results
  - i.e. Compare the follow two queries, which returns the same results but the second one is significantly faster:
  - `index=security sourcetype=winauthentication_security (EventCode=4624 OR EventCode=540) NOT [search sourcetype=history_access | rename Username as User | fields User] | stats count by User | table User`
  - `index=security (sourcetype=winauthentication_security (EventCode=4624 OR EventCode=540)) OR (sourcetype=history_access) | eval badge_access=if(sourcetype="history_access", 1, 0) | stats max(badge_access) as badged_in by Username | where badged_in=0 | fields Username`

**Troubleshooting Subsearches** when subsearch doesn't return results we wanted

- run both outter and subsearches independently to verify the query's correctness
- can view results of the subsearch in Job Inspector -> Search job properties -> normalizedSearch

<br/>

### Module 5 Combining Searches

The **Append Command**

- adds results by appending subsearch results to the end of the main search results as additional rows
- i.e. `index=security sourcetype=linux_secure "failed password" NOT "invalid user" | timechart count as known_users | append [search index=security sourcetype=linux_secure "failed password" "invalid user" | timechart count as unknown_users]`
  - this search allows to draw data on the same visualization by combining results from two searches
  - the final result data may look awkward as rows are not combined based on the save values in some of the fields
    - this can be fixed with the _first_ function, which returns the first value of a field by the order it appears in the results
    - i.e. add this at the end of last example `| timechart first(known_users), first(unknown_users)` or better: `| timechart first(*) as *`, which tells Splunk to apply _first_ on all fields and keep their original name
- This command does not auto-merge row values from two sets of results
- Note, _append_ does not work with real-time searches

The **Appendcols Command**

- adds results of a subsearch to the right of the main search's results
- i.e. the same example as used in Append Command:
  - `index=security sourcetype=linux_secure "failed password" NOT "invalid user" | timechart count as known_users | appendcols [search index=security sourcetype=linux_secure "failed password" "invalid user" | timechart count as unknown_users]`
  - with this way, _first_ function is no-longer needed, and we will see that "unknown_users" is added as a new column to the outter search's results and matches the _time field
  - this is a special example, as the timechart generates the field "time" the same way in both searches, so _appendcols_ can match on
- This command adds results of the subsearch as additional table field columns
  - there are times this command doesn't (and impossible) to auto-match values to proper rows

The **Join Command**

- combines results of subsearch with outter search using common fields
- requirement: both searches must share at least one field in common
- two types of join
  - inner join (default), only return results from outter search that have matches in the subsearch
  - outer/left join, returns all results from the outter search and those have matches in the subsearch; can be specified with argument `type=outer`
- i.e. `index="security" sourcetype=linux_secure src_ip=10.0.0.0/8 "Failed" | join src_ip [search index=security sourcetype=winauthentication_security bcg_ip=* | dedup bcg_workstation | rename bcg_ip as src_ip | fields src_ip, bcg_workstation] | stats count as access_attempts by user, dest, bcg_workstation | where access_attempts > 40 | sort - access_attempts`
  - in this example, the bcg_workstation is info from another sourcetype, we used (inner) join to make it available to the outter search while using the ip address as the common field to match for the join

The **Union Command**

- combines search results from two or more datasets into one
- Datasets can be: saved searches, inputlookups, data models, subsearches
  - corresponding keywords to use with _union_ command: _savedsearch lookup datamodel_
  - subsearches are unnamed
- i.e. `| union datamoel:Buttercup_Games_Online_Sales.successful_purchase, [search index=sales sourcetype=vendor_sales] | table sourcetype, product_name`
- when used with datasets that only use distributed streaming commands, _union_ invokes the **multisearch command**, which is a generating command that runs multiple streaming commands at the same time
- when used with one of the datasets not using streaming command, _union_ invokes the **append command** on the search head
- can tell which command used in Job Inspector -> Search job properties -> optimizedSearch property

**Other Search examples**

- i.e. `index=security sourcetype=linux_secure "fail*" earliest=-31d@d latest=-1d@d | timechart count as daily_total | stats avg(daily_total) as DailyAvg | appendcols [search index=security sourcetype=linux_secure "fail*" earliest=-1d@d latest=@d | stats count as Yesterday] | eval Averages="" | stats list(DailyAvg) as DailyAvg, list(Yesterday) as Yesterday by Averages`
  - this search shows a technique to create empty column to allow display data compared in a bar chart visualization
- i.e. `index=web sourcetype=access_combined status>=400 (host=www1) OR (host=www2) | fields host, status | stats dc(host) as hostCount by status | where hostCount=2 | fields - hostCount`
  - this search shows a technique to know whether two searches diff on a field have data shared in both

<br/>

### Module 6 Manipulating Data

The **Bin Command** adjusts and groups numerical values into discrete sets (bins) so that all the items in a bin share the same value

- i.e. `index=sales sourcetype=vendor_sales | stats sum(price) as totalSales by product_name | bin totalSales | stats list(product_name) by totalSales | eval totalSales = "$".totalSales`
- can take a _span_ argument to specify the bin size to group on
- overrides the field values passed-in; does not create new field, need to create backup field using _eval_ if desired

The **xyseries Command** converts statistical results into a tabular format suitable for visualizations

- useful for additional process after initial statistical data is returned
  - solves the issue that after _chart_ and _timechart_, cannot use _eval_ to do additional data tweaking
- Syntax `| xyseries x-axis-field, y-axis-field, y-axis-data`
- i.e. `index=web sourcetype=access_combined | bin _time span=1h | stats sum(bytes) as totalBytes by _time, host | eval MB = round(totalBytes/(1024*1024),2) | xyseries _time, host, MB`
- to better elaborate, see below conversions

_time|host|MB
-----|----|--
12:00|www1|12
12:00|www2|11
12:00|www3|7
...|...|...

_time|www1|www2|www3
-----|----|----|----
12:00|12|11|7
...|...|...|...

The **untable Command** does the opposite of _xyseries_, takes chartable, tabular data and format it similar to stats output

- good when need to further extract from, and manipulate values after using commands that result in tabular data
- Syntax `| untable x-axis-field, label-field, data-field`
    - label-field: field with the values to use for label names for the data series
    - data-field: field that holds the data charted series
  - i.e. `index=sales sourcetype=vendor_sales (VendorID >= 9000) | chart count as prod_count by product_name, VendorCountry limit=5 useother=f | untable product_name, VendorCountry, prod_count | eventstats max(prod_count) as max by VendorCountry | where prod_count=max | stats list(product_name), list(prod_count) by VendorCountry`
    - data is formatted in a tabular format after _chart_ command

The **foreach Command** allows to run templated subsearches for each field in a specified list

- i.e. `index=web status>=500 | chart count by action, host | eval total=0 | foreach www1, www2, www3 [eval total=total+<<FIELD>>]`
  - "www1, www2, www3" are the columns after executing _chart_ command. Here _FIELD_ refers to the value of the column_name, and each row goes through the foreach command and subsearch calculation
- i.e. Back to the example for _xyseries_, we can also use _foreach_ to achieve the same result:
  - `index=web sourcetype=access_combined | timechart span=1h sum(bytes) as totalBytes by host | foreach www* [eval <<FIELD>> = round(<<FIELD>>/(1024*1024),2)]`
- i.e. Great example:
  - `index=web sourcetype=access_combined action=purchase | chart sum(price) by product_name, clientip limit=0 | addtotals | sort 5 Total | fields - Total | untable product_name, clientip, count | xyseries clientip, product_name, count | addtotals | sort 3 -Total | fields - Total`

<br/>

### Module 7 Multivalue Fields

Splunk provides functions specifically work with multi-valued fields _mvsort mvfilter mvjoin mvzip mvcount split mvindex makemv mvexpand_

- _mvsort_ takes a given multi-valued field and sorts its values in lexicographical order (usually UTF encoding)
  - i.e. `index=systems sourcetype=system_info | rename ROOT_USERS{} as root_users, SYSTEM{} as system | dedup system root_users | eval root_users=mvsort(root_users) | stats list(root_users) by system`
    - the origin field names may look funky and must be renamed, as they are extracted from json data
  - note that _values_ function also auto-sort the values of a given field
- _mvfilter_ is useful to narrow results based off values in a multi-valued field
  - accepts a boolean expression and references only one field at a time
  - i.e. `index=systems sourcetype=system_info | rename SYSTEM{} as system | eval uk_system=mvfilter(match(system, "UK$")) | dedup uk_system | sort uk_system | table uk_system`
    - tells to filter out values of field 'system' that does not end with 'UK'
  - _mvfilter_ will return null values if they exist in the data
    - can make it not return null values by
    - `mvfilter(!=isnull(x))` or `mvfilter(isnotnull(x))`
- _mvjoin_ allows joining all values of a multi-valued field with a delimiter, resulting a single-value field
  - accepts a field name and a string delimiter
  - i.e. `index=systems sourcetype=system_info | rename ROOT_USERS{} as root_users, SYSTEM{} as system | eval root_users=mvsort(root_users), root_users=mvjoin(users, ",") | dedup system root_users | eval root_users=mvsort(root_users) | stats list(root_users) by system`
- _mvzip_ combines two sets of multi-valued fields, pairing their values together in a new set, with an optional delimiter to separate values
  - i.e. `index=systems sourcetype=system_info | rename CPU_CORES{}.core as core, CPU_CORES{}.core_percent_used as percent_used | eval core_percent_used=mvzip(core, percent_used, " : ") | table _time, SYSTEM{}, core_percent_used`
- _mvcount_ counts the number of results for a multi-valued field for each event
  - i.e. `index=systems sourcetype=system_info | rename CPU_CORES{}.core as core | eval number_of_cores=mvcount(cores) | where number_of_cores>4 | stats values(SYSTEM{}) as "server with +4 cores"`
- _split_ can create new multi-value field out of single key-value pairs
  - accepts a field name and a string delimiter
  - i.e. `index=sales sourcetype=vendor_sales | eval account_codes=split(productId, "-") | dedup product_name | table product_name, productId`
- _mvindex_ assigns an array index to a multi-value field
  - allows reference a value by its location in the array
  - index begins from 0
  - i.e. `index=sales sourcetype=vendor_sales | eval account_codes=split(productId, "-"), type_code=mvindex(account_codes, 2), product_type=case(like(type_code, "G%"), "Game", like(type_code, "A%"), "Accessory", like(type_code, "T%", "T-shirt")) | stats count by product_type`
- all above functions can be used with _eval where fieldformat_ commands
- The **Makemv Command** can also create multi-value fields
  - distributable streaming command
  - replaces existing single-value field
  - splits values using delimiter or regex
  - i.e. `index=sales sourcetype=vendor_sales | eval account_codes=productId | makemv delim="-", account_codes | dedup product_name | table product_name, productId, account_codes`
    - same results can be achieved by using regex and specifying capture groups:
    - `| makemv tokenizer="([A-Z]{2}|[A-Z]{1}[0-9]{2})", account_codes`
- The **Mvexpand Command** creates separate event for each value contained in a multi-value field
  - distributable streaming command
  - creates new events count as of the number of values in a multi-valued field and copy all other values to the new evnets
  - it does not create new events in the index, only created in memory for the period of the search
  - best to remove unused fields before the _mvexpand_ command
  - i.e. `index=systems sourcetype=system_info | mvexpand ROOT_USERS{} | dedup SYSTEM{} ROOT_USERS{} | stats list(SYSTEM{}) by ROOT_USERS{}`

<br/>

### Module 8 Advanced Transactions

The **Transaction Command** is used to group events spanning a period of time

- it helps build a story of the journey for a certain action started and ended at some point
- for _transaction_ command to work properly, events should be in a reversed chronological order
- it is a resource-intensive command and should be avoided when you can
- i.e. `index=web sourcetype=access_combined | transaction JESSIONID endswith=(status=503) maxevents=5 | hightlight 503`
- The _coalesce_ function accepts any number of fields and returns the first value that is not null.
  - this helps to normalize data returned from different datasets so we can do _transaction_ on the data
  - i.e. `((index=network sourcetype=cisco_wsa_squid) OR (index=web sourcetype=access_combined (action=addtocart OR action=purchase))) | eval uniqueIp = coalesce(c_ip, clientip), Action=if(sourcetype="access_combined", action, null()), Employee=if(sourcetype="cisco_wsa_squid", username, null()) | transaction uniqueIp startswith=(Actions=addtocart) endswith=(Actions=purchase) | stats list(Actions) as Actions by Employee, uniqueIp | dedup Employee | fields Employee`
- The _case_ function is an alternative to _coalesce_ to normalize fields for _transaction_
  - i.e. changes on the above example replacing _coalesce_
  - `| eval uniqueIp=case(sourcetype="access_combined", clientip, sourcetype="cisco_wsa_squid", c_ip)`

**Complete & Incomplete Transactions**

- useful when using both _startswith endswith_ arguments and to keep those transactions where the _endswith_ condition was not met
  - add _keepevicted=true_ argument will keep incomplete transactions in results
  - an internal & hidden field 'closed_txn' will be added to indicate whether this transaction is completed
- i.e. `index=web sourcetype=access_combined | transaction JESSIONID startswith=(action="addtocart") endswith=(action="purchase") keepevicted=true | search action="addtocart" | stats count(eval(closed_txn=0)) as "Total Failed", count(eval(closed_txn=1)) as "Total Successful", count as "Total Attempted" | eval "Percent Completed" = round(((('Total Attempted'-'Total Failed')*100)/'Total Attempted'),0) | table "Total Attempted", "Total Successful", "Percent Completed"`

**Transaction vs Stats**

- to build a transaction, all events data is searched and required, and is done on the Search Head
- when using stats, we can limit the data operated on to only the set of data needed; can use _fields_ which is a distributable streaming command filter data on the indexers
- i.e. compare the following two searches
  - uses transaction: `index=web sourcetype=access_combined | transaction JESSIONID | where duration > 0 | stats avg(duration) as avgd, avg(eventcount) as avgc | eval "Average Time On Site"=round(avgd, 0), "Average Page Views"=round(avgc, 0) | table "Average Time On Site", "Average Page Views"`
  - uses stats: `index=web sourcetype=access_combined | fields JESSIONID | stats range(_time) as duration, count as eventcount by JESSIONID | where duration > 0 | stats avg(duration) as avgd, avg(eventcount) as avgc | eval "Average Time On Site"=round(avgd, 0), "Average Page Views"=round(avgc, 0) | table "Average Time On Site", "Average Page Views"`

<br/>

### Module 9 Working With Time

**Review about time**

- _earliest_ and _latest_ overrides the time selectors for the search
  - timeunits: https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/SearchTimeModifiers
  - snap to beginning of timeunit using '@' followed by a timeunit

**Advanced Searches that uses time**

> Use case: when there is a need to aggregate information for two different time ranges and be able to compare them on the same visualization

- i.e. `index=security sourcetype=linux_secure "failed password" earliest=-24h@h latest=@h | timechart count span=1h | eventstats avg(count) as HourlyAverage`
  - tells to search over last 24 hours with each hour snap to beginning of hour
  - **shortcoming**: the average value is only done over the entire time range of the search, it won't be useful when we want to display an average value of a longer period of time to compare with
- i.e. `index=security sourcetype=linux_secure "failed password" earliest=-30d@d latest=@d | timechart count span=1h as HourlyCount | eval Hour=strftime(_time, "%H") | stats avg(HourlyCount) as AvgPerHour`
  - this search gives the average count per hour for the last 30 days
- i.e. to solve the **shortcoming** above
  - `index=security sourcetype=linux_secure "failed password" earliest=-30d@d latest=@h | eval Previous24h=relative_time(now(), "-24h@h"), Series=if(_time>=Previous24h, "last24h", "prior") | timechart count span=1h by Series | eval Hour=strftime(_time, "%H"), currentHour=strftime(now(), "%H"), offset=case(Hour<=currentHour, Hour-currentHour, Hour>currentHour, (Hour-24)-currentHour) | stats avg(prior) as "30 Day Average for Hour", sum(last24) as "Last 24 Hours" by Hour, offset | sort offset | fields - offset | rename Hour as "Hour of Day"`
  - Here it used _relative_time_ to set a timestamp to compare to, and marked events with a 'Series' field from the time comparision; this is used to filter events in _stats_ command
  - Then it marked each event with an 'Hour' field optained from the '_time' field, which is used to compare to current hour to precisely calculate average for the hours arranged related to current hour
  - the 'offset' field is used to sort the results in the correct chronological order

> Use case: when there is a need to display some aggregated information for a certain time window on many days

- i.e. `index=web sourcetype=access_combined action=purchase earliest=-3d@d latest=@d date_hour>=0 AND date_hour<6 | bin span=1h _time | stats sum(price) as hourlySales by _time | eval Hour=strftime(_time, "%b %d, %I %p"), "Hourly Sales"="$".tostring(hourlySales) | table Hour, "Hourly Sales"`
  - note that the generated fields like `date_hour date_minute ...` are not converted to the user's local timezone
    - extracted at search time
  - to do this, need to create the 'hour' field ourselves using `| eval localhour=tonumber(strftime(_time, "%H"))` then search the events by the 'localhour' `| search localhour>=0 AND localhour<6`

date format code can be found here https://docs.python.org/2/library/datetime.html#strftime-strptime-behavior
Splunk Documentation https://docs.splunk.com/Documentation
