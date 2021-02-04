---
layout: note_page
title: Begin to Advanced Splunk III
title_short: splunk_notes_advanced
dateStr: 2020-01-01
category: Tool
tags: notes reference check
---

## Splunk 7 Fundamentals III (IOD)

This course focuses on additional search commands as well as **advanced use of knowledge objects**. Major topics include **advanced statistics and eval** commands, **advanced lookup** topics, **advanced alert** actions, using **regex and erex to extract fields**, using **spath to work with self-referencing data**, creating **nested macros and macros with event types**, and **accelerating reports and data models**.

<br/>

### Module 1 Intro

Review contents in previous courses.

<br/>

### Module 2 Exploring Stats

**Stats Aggregate Functions** besides the _count, dc, sum, min, max, avg_ aggregation functions for summarizing values from events for _stats_ command, there are also: _median, range, stdev, var_ that can be used in _stats, chart, timechart_ commands

- _mean_ can be used in place of _avg_ function
- we need to use single quotes for names containing spaces in an _eval_ expression
- https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Aggregatefunctions

**Fieldsummary Command** is used to calculate summary statistics for fields in your events

- Given a search `index=web | fieldsummary` it gives insights of the "count, distinct_count, is_exact, min/max/mean/stdev, numberic_count, values" for each field
- adding a field name as the argument to this command, only summary for that field is returned
- by default, returns 100 distinct values per field, can be override with `maxvals` function

**Appendpipe Command** append subpipeline search data to your results

- it is not run until the command is reached
- it is not an additional search, but merely a pipeline for the previous results
- multiple appendpipe can be used in a search
- i.e. `index=network sourcetype=cisco_wsa_squid (usage=Borderline OR usage=Violation) | stats count by usage, cs_username | appendpipe [stats sum(count) as count by usage | eval cs_username= "TOTAL: ".usage] | appendpipe [search cs_username=Total* | stats sum(count) as count | eval cs_username = "GRAND TOTAL"] | sort usage, count`

**Count and List Functions** using them in conjunction can help make the results easier to read

- _list_ returns a list of values of a field as a multi-value result (will be put in one cell in the result table), by default up to 100 values
- i.e. `index=web sourcetype=access_combined action=purchase status=200 | stats count by host, product_name | sort -count | stats list(product_name) as "Product Name", list(count) as Count, sum(count) as total by host | sort -total | fields - total`

**Eventstats Command** generates statistics for fields in searched events and save them to new fields in the results

- the statistics are added inline to pertinent events
- i.e. the command `index=web sourcetype=access_combined | stats sum(bytes) as totalBytes by clientip | table clientip, bytes, totalBytes`
    - will yield a table with no data in 'bytes' column
    - this is because the _stats_ command generates the statistics info but won't preserve info used to do the calculation
- i.e. to fix that, `index=web sourcetype=access_combined | eventstats sum(bytes) as totalBytes by clientip | table clientip, bytes, totalBytes`
    - this command will do
    - because _eventstats_ adds the result as event data available in the search raw data
- i.e. another example `index=web sourcetype=access_combined action=remove | chart sum(price) as lostSales by product_name | eventstats avg(lostSales) as averageLoss | where lostSales > averageLoss | fields - averageLoss | sort -lostSales`
    - here after _eventstats_ command, you can see the data 'averageLoss' is available in each row in the table created by chart
    - then we use its value to filter out the rows we need to keep, then get rid of that field
- i.e. yet another example `index=web sourcetype=access_combined action=purchase status=200 | timechart sum(price) as totalSales | eventstats max(totalSales) as highest, min(totalSales) as lowest | where totalSales=highest OR totalSales=lowest | eval Outcome=if(totalSales=hightest, "Highest", "Lowest") | table _time, Outcome, totalSales`

**Streamstats Command** aggregates statistics to your searched events as Splunk sees the events in time (in a streaming manner)

- there three functions quite improtant than others
    - current - setting to 'f' tells Splunk to use the field value from previous event when performing statistical function
    - window - setting to N tells Splunk to only calculate previous N events at a time
    - time_window - setting to a time span to only calculate events happen in every that time span; with this function, events must be sorted by time
- i.e. `index=web sourcetype=access_combined action=purchase status=200 | stats sum(price) as orderAmount by JESSIONID | sort _time | streamstats avg(orderAmount) as averageOrder current=f window=20`
- https://www.splunk.com/blog/2014/04/01/search-command-stats-eventstats-and-streamstats-2.html

<br/>

### Module 3 Conversion Functions

**Eval Command** Review

- Operates on existing fields and store result in a field
    - can override field value if it is the same field name
- Available arithmetic operators: + - * / %
- Available concatenation operator: .
- Available boolean operator: AND OR NOT XOR > < >= <= != = == LIKE IN

**Eval Command** Syntax

- multiple fields calculation can be created by one _eval_ command, separated by ','
    - ',' separated expressions are treated as functions, processed from left to right
    - fields created first can be used in subsequent calculation in the same _eval_ command
- three conversion functions for _eval, fieldformat, where_:
    - _tostring()_ casts a value to string; acceptable arguments: `(field, "commas"/"hex"/"duration")`, for formatting to "number with comma/hexadecimal number/time values"
    - _tonumber()_ casts a value to number (for calculation); acceptable arguments: `(field, 2)` (w is for example), for matting to base-10 number from a base-2 number
    - _printf()_ build a string from some formatting and arguments: `("formatString%s/float%.2f", Revenue)`; for `%f`, adding a ' char will show commas in the number: `%'.2f`; for `%f`, adding a + char will show either a plus or minus char in the value: `%+.2f`
    - mostly won't required unless used with arguments, as Splunk try to do them intelligently

<br/>

### Module 4 Date and Time Functions

- _eval_ can also be used to calculate date and time
    - _now_ function returns the time a search is started
        - returns time in second precision
    - _time_ function returns the time an event was processed by the _eval_ command
        - returns time in a micro-second precision
    - _strftime_ allows convert unix epoch timestamp into a string
    - _strptime_ allows convert from string to a timestamp
        - i.e. `index=manufacture sourcetype=3dPrinterData | eval boot_ts=strptime(boot_time, "%b/%d/%y %H:%M:%S"), days_since_boot=round((now()-boot_ts)/86400) | stats values(days_since_boot) as "uptime_days" by printer_name`
        - `sourcetype=foo | eval date_hour=strftime(_time, "%H") | eval date_wday = strftime(_time, "%w") | search date_hour>=9 date_hour<=18 date_wday>=1 date_wday<=5`
    - _relative_time_ returns a timestamp relative to a specified time
        - 's m h d w mon y' represents 'seconds minutes hours days week month year' respectively
        - i.e. `index=manufacture sourcetype=3dPrinterData | eval boot_ts=strptime(boot_time, "%b/%d/%y %H:%M:%S"), rt=relative_time(boot_ts, "+30d"), reboot=strftime(rt, "%x") | stats values(reboot) as "day_to_reboot" by printer_name`
- These functions can also be used with _fieldformat_ and _where_ command

<br/>

### Module 5 Text Functions

- _eval_ support functions to process text
    - _upper_ and _lower_ takes a value and return the string in upper or lower case respectively
        - use it to normalize data
        - i.e. `index=hr | eval Organization=lower(Organization), Is_In_Marketing=if(Organization=="marketing", "Yes", "No") | table Name, Organization, Is_In_Marketing`
    - _substr_ creates a field that is the value of doing substring from another field
        - i.e. `index=hr | eval Group=substr(Employee_ID, 1, 2), Location=substr(Employee_ID, -2) | table Name, Group, Location`
    - _replace_ apply a rule to replace text values in a field. regex is supported
        - i.e. `index=hr | eval Employee_Details=replace(Employee_ID, "^([A-Z]+)_(\d+)_([A-Z]+)", "Employee #\2 is a \1 in \3")`
    - _len_ returns the length of a field value
- These functions can also be used with _fieldformat_ and _where_ command

<br/>

### Module 6 Comparison & Conditional Functions

- _eval_ support functions to aid condition check
    - _if_ and _case_ functions covered before
        - i.e. `index=sales sourcetype=vendor_sales | eval salesTerritory = case(VendorID<5000, "US", VendorID<7000, "EMEA", VendorID<9000, "APAC", 1==1, "Rest of World")`
    - _coalesce_ takes a list of arguments and returns the first value not null
        - useful when combing fields
        - i.e. `index=hr sourcetype=HD_DB | eval IP=coalesce(SF_IP, BO_IP, LN_IP) | table Name, System_ID, IP`
    - _match_ takes a field and a regex to match against
        - returns "True" if is a match, "False" otherwise
        - result can be used nested in an _if_ function
    - _cidrmatch_ specifically used to match ip addresses, takes in a "CIDR" ip string and then the field to match against
    - statements functions
        - _true() false() null()_ accepts no arguments and yields True, False, and null values
        - _nullif_ takes a field and a value against, and returns null value if it matches and returns its value if not a match
        - _tostring_ can cast a True, False, null value into its String counterpart
    - informational functions
        - _isbool isint isnotnull isnull isnum isstr in_ will return True or False on assertion of the field passed in
        - _typeof_ returns a string representation of the type of the field passed in; null value returned as "Invalid"
- These functions can also be used with _fieldformat_ and _where_ command

<br/>

### Module 7 Stat & Math Functions

- _eval_ command's statistical functions
    - _min max_ takes some fields and return the lowest/hightest value from those
        - strings are compared lexicographically, and greater than numbers
    - _random_ returns a 32-bit random integer
        - i.e. `index=sales sourcetype=vendor_sales | streamstats count as eventNumber | where eventNumber = [ search index=sales sourcetype=vendor_sales | stats count as eventNumber | eval randomNumber=random() % eventNumber | return $randomNumber ] | table Vendor, VendorCity, VendorCountry`
    - mathematical functions
        - _abs ceiling exact exp floor ln log pi pow round sigfig sort_
    - cryptographic functions
        - _md5 sha1 sha256 sha512_
- These functions can also be used with _fieldformat_ and _where_ command

<br/>

### Module 8 Other functions

- other infrequently used functions for _eval_
    - trigonometry functions
        - _acos acosh asin asinh atan atan2 atanh cos cosh hypot sin sinh tan tanh_
    - multivalue functions, that can operate on multiple values
        - _mvappend mvcount mvdedup mvfilter mvfind mvindex mvjoin mvrange mvsort mvzip split_
- the **Makeresults Command** creates a defined number of search results
    - good for creating sample data for testing searches or building values to be used in searches
    - i.e. `| makeresults | eval tomorrow=relative_time(now(), "+1d"), tomorrow=strftime(tomorrow, "%A"), result=if(tomorrow="Saturday" OR tomorrow="Sunday", "Huzzah!", "Boo!"), msg=printf("Tomorrow is %s, %s", tomorrow, result)`
- These functions can also be used with _fieldformat_ and _where_ command

<br/>

### Module 9 Exploring Lookups

It has been covered that **Lookups** can enrich the data in the index with static or relatively unchanging sets of data. Fields from Lookups can be used in searches and show up in the sidebar.

- _lookup_ command can be used to lookup values
- can also configured to automatically return values by hosts, source, sourcetype
- use _lookup_ in a **subsearch** can help narrow down the set of events to search based on the values in the lookup
    - _inputlookup_ is the command to use to return values from a lookup table
    - i.e. `[ | inputlookup API_Tokens | table VendorID ]`
    - the values that subsearch returned will be used as search terms of the field-value pairs, with an OR operator between
    - the outter search of above subsearch will include events with only those VendorID from the lookup
    - to exclude the results from the subsearch, add NOT before the subsearch `NOT [ ... ]`
- **Splunk Key Value Store**, aka KV Store, is a way to store/retrieve data in Splunk apps, or create lookups from it
    - add data using Json POSTs to the Splunk API or the _outputlookup_ command
    - allows per-record inserts and edits; data type enforcement; field acceleration; rest API access
    - does not support case-insensitive lookups
    - KV collections defined in collections.conf
- **File-based Lookups** such as CSV file
    - need to use _inputlookup_ command
    - good for small or rarely modified lookups
    - allow case-sensitive lookups, easy text editing
    - does not support rest API
    - does not do per-record edits
    - no data type enforcement
    - no multi-user access locking
- **External Lookups** using scripts to fetch values for lookups; the speed of the script determines the speed of the lookup
    - need to use _lookup_ command
    - underlying file type is csv
- **Geospatial Lookups** matches data with geographic feature collections in KMZ or KML files, and output fields with geographic information
    - output field represent geographic regions shared borders with other regions of the same type
- **DB Connect Lookups** bridges Splunk to a relational DB, allows use of Splunk queries and reports with them, and adds data to our search
    - use `dbxlookup lookup=<db_connect_source>` in Search app, after setting up the connect
- **Lookups Best Practices**
    - in lookup table, keep the key field the first column
    - put lookups at the end of the search
    - if a lookup usage is very common in search, make it automatic
    - use KV store or gzip CSVs for large lookup table
    - only put data being used in lookup table
- **Outputlookup Command** can output results of search to a static lookup table file or KV Store collection
    - can overwrite an existing lookup table file
    - _createinapp_ is the bool to control whether create in system lookup directory

<br/>

### Module 10 Exploring Alerts

**Alerts** are triggered when specific conditions in search results is triggered

- alert actions including
    - sending emails
    - logging events
        - Admin or edit_tcp capability required
        - in log event, use `$result.fieldname$` to access field value
        - https://docs.splunk.com/Documentation/Splunk/latest/AdvancedDev/ModAlertsLog
    - output to a lookup
    - using webhooks
        - can POST Json data for the results of the search triggered that alert
    - custom actions

<br/>

### Module 11 Advanced Field Creation

**Field Extractor** allows users to perform extractions from the GUI

- always best to check and edit generated regex for performance and accuracy
- Good regex resources
    - avoid backtracking (when a regex went through the entire string and misses a match and has to start over) in regex
        - i.e. given string "IPs (178.162.162.192,121.9.245.250)" and regex _\((.*)(.*)\)_ it takes three passes to get the match right
    - avoid using whildcards when possible, use '+' over '*', use '|' over greedy matches, add '?' to make greedy quantifiers non-greedy
    - alwasys test regex expression and benchmark its speed
    - https://regex101.com/
    - https://regexone.com/
    - https://www.rexegg.com/
- the **erex rex Command** allows extract fields temporarily for the duration of the search
    - _erex_ is like an auto field extractor, but had the same shortcomings as the regex field extractor: only look for based on the samples provided
        - i.e. `index=security sourcetype=linux_secure "port" | erex ipaddress examples="74.125.19.106, 88.12.32.208" | table ipaddress, src_port`
    - _rex_ allows use regex capture groups to extract values at search time
    - by default uses `field=_raw`, if not provided a field name to read from
        - i.e. `index=security sourcetype=linux_secure "port" | rex "(?i) from (?P<ipaddress>[^ ]+)" | table ipaddress, src_port`
        - i.e. `index=network sourcetype=cisco_esa | where isnotnull(mailfrom) | rex field=mailfrom "@(?P<mail_domain>\S+)"`
        - i.e. regex string `\<(?<local_part>.*)@(?<domain>.*)>`
    - use _rex_ is recommended

<br/>

### Module 12 Searching Self-Describing Data

**Self-Describing Data** includes the schema embedded in the data

- the data does not need to conform to a formal structure, such as _JSON XML_
    - the schema includes markers to separate elements
    - the schema enforce hierarchies of records and fields in the data
- Splunk will automatically recognize _JSON_ data and extract fields, but not for _XML_ data
    - setting in props.conf file, set by Admin: AUTO_KV_JSON=true; KV_MODE=XML
- **spath Command**
    - _spath_ command extracts info from semi-structured data and store in fields
    - i.e. `index=systems sourcetype=system_info_xml | spath path=event.systeminfo.cpu.percent output=CPU`
    - by default uses `input=_raw`, if not provided a field name to read from
    - when working with _JSON_ formatted data, values in array will be indicated by curly braces
        - i.e. `index=systems sourcetype=system_info_json | spath path=CPU_CORES{}.idle output=CPU_IDLE | stats avg(CPU_IDLE) by SYSTEM{}`
- _spath_ function for _eval where fieldformat_ commands
    - as an alternative to _spath_ command
    - i.e. `index=hr sourcetype=HR_DB | eval RFID=spath(Access, "rfid.chip"), Location=spath(Access, "rfid.location") | table Name, Access, RFID, Location`
- **MultiKV Command** for data formatted as large and single events of tabular data, extracts field values from them.
    - each row becomes an event, header becomes the field names, and tabular data becomes values of the fields
    - i.e. `index=main sourcetype=netstat | multikv` give all fields extracted
    - i.e. `index=main sourcetype=netstat | multikv fields LocalAddress State filter LISTEN | rex field=LocalAddress ":(?P<Listening_Port>\d+)$" | dedup Listening_Port | table Listening_Port` the _fields_ function chooses which fields to extract; the _filter_ function get only events that contain at least once of all the strings provided

<br/>

### Module 13 Advanced Search Macros

Review what has been covered for **Search Macros**

- Again, Search Macros are nothing more different than the Splunk Search Language
- Search Macros use time range set at search time
- Now is best to save complex regex for field extractions as Search Macros, that can be reused.
    - i.e. the use case of extracting emails from raw events `index=games sourcetype=simcubebeta `ExtractEmail(_raw, ExtractedEmail)` | table ExtractedEmail`
    - i.e. the ExtractEmail was created from: `| rex field=$infield$ "[\s'=<](?P<$outfield$>[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9.]+)"`
- Nested Macros is allowed, with multiple levels
    - it is like calling a function from another
    - i.e. ``ExtractEmail($infield$, $outfield$)`| rex field=$outfield$ "@(?P<$outfield$>[a-zA-Z0-9-]+\.[a-zA-Z0-9.]+)"`
- use Tags and Event Types with Macros as would do in a normal search
    - i.e. `tag=InternalFail | stats count as FailedAttempts by user | where FailedAttempts>$GT_misses$ | rename user as $checkfield$ | table $checkfield$`
    - i.e. `eventtype=online_purchase_http_errors` directly search with saved event type

<br/>

### Module 14 Acceleration: Report & Summary Index

The number of events returned in a search affects search time.

Splunk allows creation of summary of event data, as smaller segments of event data that only include those info needed to fullfill the search.

- it will be faster for searches
- three data summary creation methods:
    - Report acceleration, uses automatically created summaries, accelerates individual reports
        - Splunk runs the report and populate an acceleration summary
        - acceleration summary basically are stored results populated every 10 minutes
        - also stored as file chunks alongside indexes buckets
    - Summary indexing, uses manually created summaries, indexes separated from deployment
    - Data model acceleration, accelerates all fields in a data model, easiest and most efficient option

- for **Report acceleration**, the search has to be in Fast/Smart mode; Users must have "schedule_search" privilege
- if deleting all reports that uses summary, the summary will be deleted too
- types of commands for acceleration
    - streaming command, operate on events as they are returned, such as _eval search fields rename_
    - non-streaming, wait until all events are returned before executing. Note that streaming commands like _eval rename_ becomes non-streaming after a transforming command
    - transforming commands, order results into a data table, such as _stats chart top rare_
- Accelerated reports must include a transforming command, and before the transforming command must be streaming commands and after the transforming command must be non-streaming commands.
- Note that if Splunks sees storage used for summary exceeds 10% of total bucket size in the deployment, it will suspend summary creation for 24 hours
- If knowledge objects related to the search change, fix the search and rebuild the summary.

**Summary Indexing** should be used as alternative for **Report Acceleration** when reports do not qualify for acceleration.

- created by running a search that uses special transforming commands and writes results to a Summary Index on the search head to be used for searching.
    - requires Admin role
    - commands used are the 'si'-prefixed commands such as _sichart sitimechart sistats sitop sirare_
    - i.e. `index=security | sitop src_ip_user`
    - should be used and saved as a report that will run repeatedly and more frequently than any searches that will run against the Summary Index it creates
    - Can also give optional name-value pair for this Summary Index for easier search, like `report=summary_page_views_to_purchase`
- search a Summary Index by using `index=<summary_index_group_name> | report=<summary_index_name>`
- Avoid gaps and overlaps in the data when using **Summary Indexing** which can occur when
    - a populating report runs too long, or its time range to be longer than the frequency of the report schedule
    - a real-time schedule is used
    - Splunk goes down
- if gaps in data happen, a backfill script is required https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Managesummaryindexgapsandoverlaps; schedule populating reports to avoid gaps and overlaps


<br/>

### Module 15 Acceleration : Data Models & Tsidx

**datamodel command** allows display the structure of data models and search against them.

- i.e. `| datamodel`
    - supply the datamodel name as 1st arg to see a specific data model
    - supply object name as 2nd arg to see details of that object
    - add 'search' to enable search on the data model data
    - i.e. `| datamodel Buttercup_Games_Online_Sales http_request search | search http_request.action=purchase`

**Data Model Acceleration** speeds up reporting for all fiedls defined by the data model

- files are created and accessed to return accelerated search results, called High-Performance Analytics Store
- Two types of Data Model Acceleration
    - Adhoc, summary-creation happens automatically on data models that have not been accelerated; summary files created stays on the search head for the period that user is actively using the Pivot tool
        - Pivot search run for the first time is very slow as summary is created
        - reports created in the Pivot editor won't use the summary
        - it is a performance killer for a Splunk deployment if multiple users are doing adhoc acceleration
    - Persistent, summary files created are stored alongside the data buckets and exits as long as the data model exists
        - can be used by all users
        - Admin or 'accelerate_datamodel' role is required
        - private data models cannot be accelerated
        - data model will be Read-only after persistent acceleration
        - it also requires searches that only use streaming commands

**Time-Series Index Files (Tsidx files)** are files created for data model acceleration

- when data is pumped into Splunk, some files including _raw data files and tsidx files were created
- tsidx components:
    - lexicon, an alphanumerically ordered list of terms found in data at index-time
        - fields extracted at index-time showup as key-value pair in lexicon
        - Splunk searches lexicon first and only open and read raw event data matching the terms using the pointers
    - posting list, array of pointers that match each term to events in the raw data files
- building of tsidx files also happen when a data model is accelerated
    - for persistent acceleration, updated tsidx every 5 min and remove-outdated after 30 min

**Tstats Command** is for getting statistical info from tsidx files

- uses lexicon and won't open raw data file
- can only use fields designated in the lexicon
- i.e. `| tstats values(sourcetype) as sourcetype by index`
    - any _stats_ functions can be used
- i.e. `| tstats count from datamodel=linux_server_access by host`
    - the _from_ clause tells _tstats_ to use the files created when accelerated 'linux_server_access' data model
- i.e. `| tstats count as "count" from datamodel=linux_server_access where web_server_access.src_ip=10.* web_server_access.action=failure by web_server_access.src_ip, web_server_access.user summariesonly=t | where count > 300 | sort -count`
    - by default, Splunk will do full search if the search ran is outside of the summary range of the accelerated data model
    - can limit search to summary range with _summariesonly_ argument
- i.e. `| tstats count as "events" by _time span=1d | sort -_time`
    - 'span' can be used to limit the time block for creating the stats
