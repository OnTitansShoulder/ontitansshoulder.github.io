---
layout: note_page
title: Splunk References
title_short: splunk_references
dateStr: 2020-01-01
category: Tool
tags: notes reference check
---

This note page serves as a quick reference for Splunk Search commands and tricks.

## Splunk Brief 

### What Splunk is good for

Monitoring, alerting, debugging issues and outages, generating reports and insights.

Its **workflow** is roughly: Index Data -> Search & Investigate -> Add Knowledge -> Monitor & Alert -> Report & Analyze

Splunk **Data Sources** can be from: Computers, network devices, virtual machines, Internet devices, commnuication devices, sensors, databases, logs, configurations, messages, call detail records, clickstream, alerts, metrics, scripts, changes, tickets, and more.

### Splunk Modules

- **Indexer** - Process **incoming data** and string results in indexes as **events**
    - Create files organized in sets of directories by **age**
    - When searching, Splunk only open the dirs that match the **time frame** of the search
- **Search Heads** - all users to search the data using Splunk Search Language
    - Takes the search, divide and conquor and **distribute** work to indexers, and **aggregate** the results got back
    - Also serve tools like **dashboards, alerts, reports**
- **Forwarders** - Splunk Enterprise component that consumes data and **forward** to the indexers for process and save
    - Usually resides on the machines where the data origins and requires negligible resources
    - Primary way data is supplied for indexing

For a large scale of data sources, it is better to split the Splunk installation into multiple **specialized instances**: multiple Search Heads and Indexers (which can form clusters), and many Forwarders.

Read More: https://splunkbase.splunk.com/ and http://dev.splunk.com/

### Splunk User Types

- **Admin User** - access to **install apps**, create knowledge objects for all users
- **Power User** - access to **create and share** knowledge objects for users of an app and do realtime searches
- **User** - only see their own knowledge objects and those shared with them
    - knowledge objects created must be made share-in-app by Power User for it to be seen by other Users

### Get Data into Splunk

- Admin User upload data files through web UI
- Configure Splunk to monitor some files locally on the machine
    - Event Logs, File System changes, Active Directory, Network Info
- (Main) Receive data from external Forwarders
    - Read more: https://docs.splunk.com/Documentation/Splunk/latest/Data/Usingforwardingagents

## Search and Report App

The **Search & Report** app allows you to search and analyze data through creating knowledge objects, reports, dashboards and more.

### Search UI

`Events` tab displays the events returned for your search and the **fields extracted** from the events.

`patterns` tab allows you to see patterns in your data.

If your search generates statistics or visuals, they will appear in `Statistics` and `Visualization` tabs. Commands that create statistics and visualizations are called **transforming commands**, they transform data into data tables.

By default, a search is active & valid for **10 minutes**, otherwise needs rerun.

A **shared search job** is active for **7 days** and its first-ran result visible by anyone you shared with.

From the web UI, use `Search & Reporting` -> `Search History` to quickly view recent searches and reuse the searches if possible.

Also from the web UI, use `Activity` -> `Jobs` to view recent search jobs (with data). Then further use `Job -> inspect job` to view the query performance.

#### Search Fields

**Search fields** are `key=value` string in the search query and will be **automatically extracted** and available for use by commands for creating insights. The key is **case-sensitive** but the value is not.

Three fields ALWAYS available are `hosts`, `source`, and `sourcetype`. **Interesting fields** are those appear within **at least 20%** of the events

From the extracted fields, `a` denotes a String value, `#` denotes a numeral value

In the search, `= !=` can be used on numeral and String values; `> >= < <=` can be used on numeral values only.

#### Tags

**Tags** are Knowledge Objects allow you to designate **descriptive names** for `key-value` pairs.

It is useful when you have logs that multiple fields may have the same value(s) you want to filter with. Then you can tag those fields with the same tag name and in future searches do filter with the tag name.

Tags are **value-specific** and are case-sensitive. When you tag a key-value pair you are associating a tag with that pair. When the field appears with another value then it is not tagged with this tag name.

Do NOT tag a field having **infinite possible values**.

Steps: in a Splunk search, click on an event and see the list of key=vlaue pairs and in actions dropdown select `Edit Tags` to add new tags (comma separated).

To search with tags, enter `tag=<tag_name>`. For example, `index=security tag=SF` matches all fields that are tagged with that value. To limit a tag to a field do `tag::<field>=<tag_name>`

Read more about tags in [doc page](https://docs.splunk.com/Documentation/Splunk/8.1.2/Knowledge/TagandaliasfieldvaluesinSplunkWeb){target=_blank}

#### Event Type

**Event Type** allows saving a search's **definition** and use the definition in another search to **highlight** matching events. It is good for **categorizing events** based on search terms. The priority settings affects the display order of returned results.

Steps: after a search, save as "Event Type" and use it in another search with `eventtype`. For example, `index=web sourcetype=access_combined eventtype=purchase_strategy`

### Knowledge Objects

**Knowledge Objects** are like some tools to help **discover and analyze data**, which include data interpretation, classification, enrichment, normalization, and search-time-mapping of knowledge (Data Models).

Saved Searches, Reports, Alerts, and Dashboards are all Knowledge Objects.

#### Field Extractor

The **Field Extractor** allows to use a GUI to extract fields that **persist as Knowledge Objects** and make them reusable in searches.

It is useful if the information from events are **badly structured** (not in some `key=value` fashion), such as simple statements in a natural language but contains useful information in a specific **pattern**.

Fields extracted are **specific** to a `host, source, or sourcetype` and are **persistent**. Two different ways a field extractor can use: **regex** and **delimiters**:

- **regex**: using regular expression, work well when having unstructured data and events to extract fields from
- **delimiters**: a delimiter such as comma, space, or any char. Use it for things like CSV files

Three ways to access a field extractor:
    - Settings -> Fields
    - The field sidebar during a search
    - From an event's actions menu (easiest)

Read more from the [docs page](http://docs.splunk.com/Documentation/Splunk/latest/Knowledge/AboutSplunkregularexpressions){target=_blank} for Splunk regex.

#### Field Aliases

**Field Aliases** give you a way to **normalize data** over **multiple sources**.

For example, when aggregating results from multiple sources or indexes, but the data logged may have fields with different names such as url, uurl, dest_url, service_url, etc. which all refers to the same thing. Then this tool is handy.

You can create one or more aliases to any **extracted field** and can apply them to [lookup](#lookups).

- Steps: Settings -> Fields -> Field aliases (add new)
    - set destination app
    - name (choose a meaningful name for the new field)
    - apply to (sourcetype, source, or host) and its matching value
    - Map fieldName=newFieldName
    - Map multiple fields by adding another field

#### Calculated Field

**Calculated Field** saves **frequently** used calculation you would do in searches with complex _eval_ statements and it is like a shorthand for a function made of SPL commands on **extracted fields**.

For example, you might want to save something to do conversion between bytes to megabytes, or encoding some field to sha256, etc.

- Steps: Settings -> Fields -> Calculated fields (add new)

#### Search Macros

**Macros** are **reusable** search strings or portions of search strings. It is useful for frequent searches with complicated search syntax and can store **entire search strings**.

You can pass arguments (fields or constants) to the search.

Steps: Settings -> Advanced Search -> Search macros (add new)

Then use it in the search by surrounding the macro name with backticks. For example: `index=sales sourcetype=vendor_sales | stats sum(sale_price) as total_sales by Vendor | ``convertUSD`` `

Within a search, use `ctrl-shift-E` or `cmd-shift-E` to **preview and expand** the macro used without running it.

#### Datasets

**Datasets** are small **subsets of data** for specific purposes, defined like tables with fields names as columns and fields values as cells.

##### Lookups

Lookups are in fact datasets that allow you to add useful values to your events not included in the indexed data.

Field values from a Lookup are case sensitive by default

Set it up in Splunk UI -> Settings -> Lookups -> Define a lookup table

Use `| inputlookup <lookup_definition_name>` to verify lookup is setup correctly. 

Additionally, you can populate lookup table with search results or from external script or linux executable. Read more about [external lookups](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Configureexternallookups){target=_blank} and [KVstore lookups](https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/ConfigureKVstorelookups){target=_blank}

Some tips for using lookups:

- in lookup table, keep the key field the first column
- put lookups at the end of the search
- if a lookup usage is very common in search, make it automatic
- use KV store or gzip CSVs for large lookup table
- only put data being used in lookup table
- the `outputlookup` can output results of search to a static lookup table

#### Pivot

**Pivot** allows users to get knowledge from the data without learning SPL in deep; a UI-based tool can help the users with creating useful searches. It is like a tool created by knowledgable Splunk users to serve the users don't know much about Splunk.

#### Data Models

**Data Models** are made of Datasets and are knowledge objects that provide the data structure that drives Pivots. It can also be used to significantly **speed up** searches, reports, and dashboard.

Data Models must be created by **Admins and Power Users** and are **hierarchically strucutred** datasets. Starting from a Root Object (a search with index and sourcetype), then add Child Objects (a filter or constraint).

Data Models are good for **accelerating searches**. Doing searches on data models are like searching on some cached events that gets updated regularly.

Steps: Settings -> Data Models -> New Data Model

Then search the datamodel with `| datamodel keywords`

Read more from the [doc page](http://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Acceleratedatamodels){target=_blank}

## Splunk Search Language (SPL)

### SPL Components

- **Search Terms** - defines what data to return
    - i.e. `host=xxx status>399`
    - also includes **Boolean operators** (`NOT OR AND` in its evaluation precedence)
- **Commands** - process search results and, create charts, compute statistics, and format results
    - i.e. `eval` in `eval foo=1`
- **Functions** - serves supplying additional conditions and algorithms to compute and evaluate the results in Commands
    - i.e. `avg` in `stats avg(latency) by host`
- **Arguments** - variables we want to apply to the Functions
    - i.e. `latency` in `stats avg(latency) by host`
- **Clauses** - how we want the results grouped
    - i.e. `by` in `stats avg(latency) by host`

Search Terms, Command names, Function names are **NOT case-sensitive**, with the exception to the command `replace` where search term must be an exact match.

#### Search Terms

- **Keywords**, any keywords can be searched on; "AND" boolean is implied for multiple keywords
- **Booleans**, AND OR NOT
- **Phrases**, keywords surrounded by ""
- **Fields**, key=value pair search
- **Wildcards**, used in keywords and fields to match any chars; inefficient if used at the beginning of a word
- **Comparisons**, = != < <= > >=

### SPL Commands

#### Non-Transforming Commands

##### appendpipe

**Append** subpipeline search data as events to your search results. Appended search is NOT run until the command is **reached**.

`appendpipe` is NOT an additional search, but merely a pipeline for the previous results. It acts on the data received and appended back **new events** while **keeping** the data before the pipe. It is useful to add summary to some results.

??? note "Example"
    ```sh
    index=network sourcetype=cisco_wsa_squid (usage=Borderline OR usage=Violation) 
    | stats count by usage, cs_username
    | appendpipe 
        [stats sum(count) as count by usage
        | eval cs_username= "TOTAL: ".usage]
    | appendpipe 
        [search cs_username=Total*
        | stats sum(count) as count
        | eval cs_username = "GRAND TOTAL"]
    | sort usage, count
    ```

##### addtotals

Compute the SUM of ALL **numeric fields** for **each event** (table row) and creates a `total` column (default behavior).

You can override the default behavior and let it calculate a sum for a **column**, see the example.

??? note "Example"
    ```sh
    # adds a column to calculate the totals of all numeric fields per row
    index=web sourcetype=access_combined
    | chart sum(bytes) over host by file
    | addtotals fieldname="Total by host"
    # adds a row to calculate the totals of one column
    index=web sourcetype=access_combined
    | chart sum(bytes) as sum over host
    | addtotals col=true label="Total" labelfield=sum
    ```

##### dedup

**Remove duplicated** events from results that share common values from the fields specified.

??? note "Example"
    ```sh
    index=security sourcetype=history* Address_Description="San Francisco"
    | dedup Username # can be a single field or multiple fields
    | table Username First_Name Last_Name
    ```

##### erex

Like an auto field extractor, but had the same shortcomings as the regex [field extractor](#field-extractor) through Splunk UI: only look for matches based on the samples provided. Better use [`rex`](#rex) command.

??? note "Example"
    ```sh
    index=security sourcetype=linux_secure "port"
    | erex ipaddress examples="74.125.19.106, 88.12.32.208"
    | table ipaddress, src_port
    ```

##### eval

**Calculate** and **manipulate** field values in many powerful ways and also works with **multi-value** fields. Results can create new fields (case-sensitive) or override existing fields.

Multiple field expressions can be calculated on the same eval command, and one is created/altered after another so the **order** of these expressions matters.

Besides the many Functions it supports, `eval` supports **operators** include arithmetic, concatenation (using `.`), and boolean.

??? note "Example"
    ```sh
    index=network sourcetype=cisco_wsa_squid
    | stats sum(sc_bytes) as Bytes by usage
    | eval bandwidth = round(Bytes/1024/1024, 2)
    # eval with if conditions and cases
    | eval VendorTerritory=if(VendorId<4000, "North America", "Other")
    | eval httpCategory=case(status>=200 AND status<300, "Success", status>=300 AND status<400, "Redirect", status>=400 AND status<500, "Client Error", status>=500, "Server Error", true(), "default catch all other cases")
    # eval can be used as a Function with stats command to apply conditions
    index=web sourcetype=access_combined
    | stats count(eval(status<300)) as "Success", ...
    ```

Supported Functions see [docs page](https://docs.splunk.com/Documentation/Splunk/8.1.2/SearchReference/CommonEvalFunctions){target=_blank}

##### eventstats

Generates **statistics** for fields in searched events and save them as **new fields** in the results. Each event will have the SAME value for the statistics calculated.

??? note "Example"
    ```sh
    index=web sourcetype=access_combined action=remove
    | chart sum(price) as lostSales by product_name
    | eventstats avg(lostSales) as averageLoss
    | where lostSales > averageLoss
    | fields - averageLoss
    | sort -lostSales
    ```

Supported Functions see [docs page](https://docs.splunk.com/Documentation/Splunk/8.1.2/SearchReference/CommonStatsFunctions){target=_blank}

See also [`streamstats`](#streamstats) command.

##### fieldformat

**Format** values WITHOUT changing characteristics of underlying values. In other words, only a format is specified when the value is displayed as outputs and the same field can **still participate calculations** as if their values are not changed.

??? note "Example"
    ```sh
    index=web sourcetype=access_combined product_name=* action=purchase
    | stats sum(price) as total_list_price, sum(sale_price) as total_sale_price by product_name
    | fieldformat total_list_price = "$" + tostring(total_list_price)
    ```

Supported Functions see [docs page](https://docs.splunk.com/Documentation/Splunk/8.1.2/SearchReference/CommonEvalFunctions){target=_blank}. Specifically look for Conversion Functions and Text Functions.

##### fields

**Include or exclude** fields from search results to limit the fields to display and also make search run faster.

**Field extraction** is one of the most **costly** parts of searching in Splunk. Eliminate unnecessary fields will improve search speed since field inclusion occurs BEFORE field extraction, while field exclusion happens AFTER field extraction.

Internal fields like _raw_ and _\_time_ will ALWAYS be extracted, but can also be removed from the search results using `fields`.

??? note "Example"
    ```sh
    index=web sourcetype=access_combined
    | fields status clientip # only include fields status and clientip
    index=web sourcetype=access_combined
    | fields - status clientip # to exclude fields status and clientip
    ```

##### fillnull

Replaces any null values in your events. It by default fills NULL with `0` and it can be set with `value="something else"`

??? note "Example"
    ```sh
    index=sales sourcetype=vendor_sales
    | chart sum(price) over product_name by VendorCountry
    | fillnull
    ```

##### lookup

Invoke field value lookups.

!!! note "Example"
    ```sh
    # http_status is the name of the lookup definition
    # code is one of the columns in the csv, and we have status in our event
    # defualt all fields in lookup table are returned except the input fields
    #   specify OUTPUT to choose the fields added from the lookup
    index=web sourcetype=access_combined NOT status=200
    | lookup http_status code as status,
        OUTPUT code as "HTTP Code",
            description as "HTTP Description"
    ```

##### multikv

**Extract** field values from data formatted as large and single events of **tabular data**. Each row becomes an event, header becomes the field names, and tabular data becomes values of the fields.

Example of some data event suitable:

```
Name     Age   Occupation
Josh     42    SoftwareEngineer
Francine 35    CEO
Samantha 22    ProjectManager
```

??? note "Example"
    ```sh
    index=main sourcetype=netstat
    | multikv fields LocalAddress State filter LISTEN
    | rex field=LocalAddress ":(?P<Listening_Port>\d+)$"
    | dedup Listening_Port
    | table Listening_Port
    ```

##### rename

**Rename** one or more fields. After the rename, subsequent commands must use the new names otherwise operation won't have any effects.

Note that after `rename` if a field name contains **spaces**, you need to use **single quotes** on the field name to refer to it in subsequent commands.

??? note "Example"
    ```sh
    index=web sourcetype=access* status=200 product_name=*
    | table JESSIONID, product_name, price
    | rename JESSIONID as "User Session Id",
            product_name as "Purchased Game",
            price as "Purchase Price"
    ```

##### rex

Allow use regex capture groups to extract values at search time. By default, it uses `field=_raw` if not provided a field name to read from.

??? note "Example"
    ```sh
    index=security sourcetype=linux_secure "port"
    | rex "(?i) from (?P<ipaddress>[^ ]+)"
    | table ipaddress, src_port

    index=network sourcetype=cisco_esa
    | where isnotnull(mailfrom)
    | rex field=mailfrom "@(?P<mail_domain>\S+)"
    ```

Better examples can be found at [doc page](https://docs.splunk.com/Documentation/Splunk/8.1.2/SearchReference/Rex#Examples){target=_blank}

##### search

Add search terms further **down the pipeline**. In fact, the part before the first `|` is itself a `search` command.

??? note "Example"
    ```sh
    index=network sourcetype=cisco_wsa_squid usage=Violation
    | stats count(usage) as Visits by cs_username
    | search Visits > 1
    ```

##### sort

Organize the results **sorted** by some fields.

??? note "Example"
    ```sh
    sourcetype=vendor_sales
    | table Vendor product_name sale_price
    | sort - sale_price Vendor
    # the '-' here affects all fields
    | sort -sale_price Vendor
    # sort-decending will only affect sale_price while Vendor is sorted ascending
    | sort -sale_price Vendor limit=20
    # will also limit the results for the first twenty in sorted order.
    ```

##### spath

Extracts info from **semi-structured data** (such as xml, json) and store in fields. It by default uses `input=_raw`, if not provided a field name to read from.

??? note "Example"
    ```sh
    index=systems sourcetype=system_info_xml
    | spath path=event.systeminfo.cpu.percent output=CPU

    # working with json, values in array specified with {}
    index=systems sourcetype=system_info_json
    | spath path=CPU_CORES{}.idle output=CPU_IDLE
    | stats avg(CPU_IDLE) by SYSTEM

    # spath Function
    index=hr sourcetype=HR_DB
    | eval RFID=spath(Access, "rfid.chip"), Location=spath(Access, "rfid.location") 
    | table Name, Access, RFID, Location
    ```

Better examples see [doc page](https://docs.splunk.com/Documentation/Splunk/8.1.2/SearchReference/Spath){target=_blank}

##### streamstats

Aggregates statistics to your searched events as Splunk sees the events in **time** in a **streaming** manner. In other words, it calculates statistics for each event **cumulatively** at the time the event is seen.

Three important arguments to know:

- **current** - setting to 'f' tells Splunk to only use the field values from previous events when performing statistical function
- **window** - setting to N tells Splunk to only calculate previous N events at a time; default 0 means uses all previous events
- **time_window** - setting to a time span to only calculate events happen in every that time span; with this function, events must be sorted by time

??? note "Example"
    ```sh
    index=web sourcetype=access_combined action=purchase status=200
    | stats sum(price) as orderAmount by JESSIONID
    | sort _time
    | streamstats avg(orderAmount) as averageOrder current=f window=20
    # for each event, calculate the average from the previous 20 events' orderAmount field
    ```

##### table

Specify fields kept in the results and retains the data in a **tabular** format. Fields appears in the order specified to the command.

??? note "Example"
    ```sh
    index=web sourcetype=access_combined
    | table status clientip
    ```

##### transaction

**Transaction** is any group of **related events** for a **time span** which can come from multiple applications or hosts.

`transaction` command takes in one or multiple fields to make transactions, and creates two fields in the raw event: _duration_ (time between the first and last event) and _eventcount_ (number of events)

`transaction` limits 1000 events per transaction by default and is an expensive command. Use it only when it has greater value than what you can do with `stats` command.

??? note "Example"
    ```sh
    index=web sourcetype=access_combined
    | transaction clientip startswith=action="addtocart" endswith=action="purchase" maxspan=1h maxpause=30m
    # startswith and endswith should be valid search strings
    ```

##### where

Filter events to ONLY keep the results that **evaluate as true**.

Try use `search` whenever you can rather than `where` as it is more efficient this way.

??? note "Example"
    ```sh
    index=network sourcetype=cisco_wsa_squid usage=Violation
    | stats count(eval(usage="Personal")) as Personal, count(eval(usage="Business")) as Business by username
    | where Personal > Business AND username!="lsagers"
    | sort -Personal
    ```

Supported Functions see [docs page](https://docs.splunk.com/Documentation/Splunk/8.1.2/SearchReference/CommonEvalFunctions){target=_blank}. `where` shared many of the `eval` Functions.

#### Transforming Commands

##### chart

Organize the data as a regular or two-way **chart table**. To get a two-way table, you need to provide **three fields** used as table row value, table column value, and table data value. A common pattern is `chart <function(data_field)> over <row_field> by <column_field>`

`chart` is limited to display **10 columns by default**, others will show up as an "other" column in the chart visualization. The 'other' column can be turned off by passing an argument `useother=f`.

Use `limit=5` to control the **max number of columns** to display, or `limit=0` to display all columns.

??? note "Example"
    ```sh
    index=web sourcetype=access_combined status> 299
    | chart count over status by host
    # if more than one field is supplied to `by` clause without `over` clause
    # the first field is used as with a `over` clause
    # this has the same effect as above command
    index=web sourcetype=access_combined status> 299
    | chart count by status, host
    ```

Supported Functions see [docs page](https://docs.splunk.com/Documentation/Splunk/8.1.2/SearchReference/CommonStatsFunctions){target=_blank}

##### fieldsummary

Calculate summary statistics for fields in your events.

For example, given a search `index=web | fieldsummary` it gives insights of the "count, distinct_count, is_exact, min/max/mean/stdev, numberic_count, values" for each field.

If field names are provided, then only do summary for those fields provided.

##### rare

Shows the **least common** values of a field set. It is the opposite of `top` Command and accepts the same set of clauses.

??? note "Example"
    ```sh
    index=sales sourcetype=vendor_sales
    | rare Vendor limit=5 countfield="Number of Sales" showperc=False useother=True
    ```

##### stats

Produce **statistics** of our search results and need to use functions to produce stats.

The `eval` Function is handy to apply quick and concise **conditional filtering** to limit the statistics calculated from desired data.

??? note "Example"
    ```sh
    index=sales sourcetype=vendor_sales
    | stats count as "Total Sells By Vendors" by product_name, categoryid
    # apply conditions using eval Function
    index=web sourcetype=access_combined
    | stats count(eval(status<300)) as "Success", ...
    ```

Supported Functions see [docs page](https://docs.splunk.com/Documentation/Splunk/8.1.2/SearchReference/CommonStatsFunctions){target=_blank}

##### timechart

Performs stats **aggregations against time**, and time is always the x-axis. Like `chart`, except only one value can be supplied to the `by` clause

This command determines the time intervals from the time range selected, and it can be changed by using an argument `span`.

??? note "Example"
    ```sh
    index=web sourcetype=vendor_sales
    | timechart count by product_name span=1m
    ```

Supported Functions see [docs page](https://docs.splunk.com/Documentation/Splunk/8.1.2/SearchReference/CommonStatsFunctions){target=_blank}

##### timewrap

Compare the data from `timechart` further over an older time range.

Specify a time period to apply to the result of a timechart command, then display series of data based on this time periods, with the X axis display the increments of this period and the Y axis display the aggregated values over that period.

??? note "Example"
    ```sh
    index=sales sourcetype=vendor_sales product_name="Dream Crusher"
    | timechart span=1d sum(price) by product_name
    | timewrap 7d
    | rename _time as Day
    | eval Day=strftime(Day, "%A")
    ```

##### top

Finds the **most common** values of given field(s) in a result set and automatically returns count and percent columns. By default displays top 10 and the count can be set with `limit=n`; while `limit=0` yields all results.

Top Command Clauses: limit=int countfield=string percentfield=string showcount=True/False showperc=True/False showother=True/False otherstr=string

??? note "Example"
    ```sh
    index=sales sourcetype=vendor_sales
    | top Vendor product_name limit=5
    # top command also supports results grouping by fields
    index=sales sourcetype=vendor_sales
    | top product_name by Vendor limit=3 countfield="Number of Sales" showperc=False
    ```

#### Generating Commands

Commands that generates events.

##### inputlookup

Return values from a lookup table.

Useful to use it in a **subsearch** to narrow down the set of events to search based on the values in the lookup table.

??? note "Example"
    ```sh
    index=sales sourcetype=vendor_sales
        [| inputlookup API_Tokens
        | table VendorID ]
        # only take one column to use as filter; its values will be OR-ed together
        # can add 'NOT before the subsearch to exclude those vendor ids
    | top Vendor product_name limit=5
    ```

##### makeresults

Creates a defined number of search results, good for creating sample data for testing searches or building values to be used in searches.

??? note "Example"
    ```sh
    # must starts search with pipe
    | makeresults
    | eval tomorrow=relative_time(now(), "+1d"),
        tomorrow=strftime(tomorrow, "%A"),
        result=if(tomorrow="Saturday" OR tomorrow="Sunday", "Huzzah!", "Boo!"), 
        msg=printf("Tomorrow is %s, %s", tomorrow, result)
    ```

#### Special Commands

Splunk has commands to extract **geographical info** from data and display them in a good format.

##### gauge

Show a field value in a gauge.

??? note "Example"
    ```sh
    index=sales sourcetype=vendor_sales
    | stats sum(sale) as total
    | gauge total 0 3000 6000 7000
    ```

##### geom

Adds fields with geographical data structures matching polygons on a **choropleth map visulization**.

??? note "Example"
    ```sh
    index=sales sourcetype=vendor_sales
    | stats count as Sales by VendorCountry
    | geom geo_countries featureIdField=VendorCountry
    # the field `VendorCountry` must map back a country name in the featureCollection
    ```

##### geostats

Aggregates **geographical** data for use on a **map visualization**.

??? note "Example"
    ```sh
    index=sales sourcetype=vendor_sales
    | geostats latfield=VendorLatitude longfield=VendorLongitude count by product_name globallimit=4
    ```

##### iplocation

Lookup **IP address** and add **location information** to events. Data like `city, country, region, latitude, and longitude` can be added to events that include external IP addresses. Not all location info might be available depends on the IP.

??? note "Example"
    ```sh
    index=web sourcetype=access_combined action=purchase status=200
    | iplocation clientip
    ```

##### trendline

Compute **moving averages** of field values, gives a good understanding of how the data is **trending over time**.

Three trendtypes (used as Functions by `trendline` command):

- **simple moving average** (`sma`): compute the sum of data points over a period of time
- **expoential moving average** (`ema`): assigns a heavier weighting to more current data points
- **weighted moving average** (`wma`): assigns a heavier weighting to more current data points

??? note "Example"
    ```sh
    index=web sourcetype=access_combined
    | timechart sum(price) as sales
    | trendline wma2(sales) as trend ema10(bars)
    # '2' here means do calculation per 2 events
    # this number can be between 2 and 10000
    ```

#### SPL Best Practices

!!! note "'key!=value' vs 'NOT key=value'"
    A small difference: `key!=value` only includes entries where key is not NULL, while `NOT key=value` includes entries even when the key does NOT exitst on those events entries.

!!! note "use the 'IN' operator"
    Instead of doing `(key=value1 OR key=value2 OR key=value3)`, more viewable syntax: `key IN ("value1", "value2", "value3")`

!!! note "use 'index' 'source' 'host' early"
    These fields are extracted **when data was indexed** and stored and won't take time to extract at search time. It is best to use these fields early in the search to limit the data to be further processed.

!!! note "use 'inclusion' over 'exclusion'"
    Searching for exactly "something" is better than searching for "NOT something"

!!! note "specify time in the query when appropriate"
    Use relative time `earliest=-2h latest=-1h` or absolute time `earliest=01/08/2018:12:00:00` in the search. Use `@` to round down time to the nearest 0 in the unit used `earliest=-2@h`

!!! note "time is the most efficient way to improve queries search time"
    Splunk stores data in buckets (directories) containing raw data and indexing data, and buckets have maximum size and maximum time span.

    Three kinds of searchable buckets: hot, warm, cold. Access speed: **hot** (read/write, very fast, like memory) > **warm** (slow, read-only, slower medium) > **cold** (very slow, read-only, cheap and stable medium).

    When search is run, it go look for the right bucket to open, uncompress the raw data and search the contents inside.

    The **order of effectiveness** in filtering data: `time > index > source > host > sourcetype`

!!! note "create different indexes to group data"
    Having **specialized** indexes helps make Splunk searches faster and more efficient.

!!! note "be careful when using wildcards"
    Using wildcard at the **beginning of a word** cause Splunk to search all events which causes **degradation in performance**.

    Using wildcard in the **middle of a string** might cause **inconsistent** results due to the way Splunk indexes data that contains punctuation

    Best to make search as specific as possible, and only use wildcards at the **end of a word**, say `status=failure` instead of `status=fail*`

!!! note "save search as reports using fast mode"
    **Fast mode** emphasis on **performance** and returns **only essential data**.

    **Verbose mode** emphasizes **completeness** and returns **all fields and event data**.

    **Smart mode** weights tradeoffs and returns the best results for the search being run.

!!! note "use 'fields' command to extract only the fields you need"
    Doing so as **early in the search** as possible will let each indexer extract less fields, pack and return data back faster.

!!! note "consult Job Inspector to know the performance of the searches"
    It tells you which phase of the search **took the most time**. Any search that has not expired can be inspected by this tool. Read more about [Job Inspector](https://docs.splunk.com/Documentation/Splunk/latest/Search/ViewsearchjobpropertieswiththeJobInspector){target=_blank}

#### SPL Tricks

!!! note "let subsearch limit main search's time range"
    Let the subsearch output a table with a single row and columns `earliest` and `latest`

!!! note "use Functions count and list in conjunction make readable results"
    `list` returns a list of values of a field as a multi-value result (will be put in one cell in the result table), by default up to 100 values

    ```sh
    index=web sourcetype=access_combined action=purchase status=200
    | stats count by host, product_name
    | sort -count
    | stats list(product_name) as "Product Name", list(count) as Count, sum(count) as total by host
    | sort -total
    | fields - total
    ```

!!! note "use Functions strftime, strptime, relative_time to extract/convert time"
    ```sh
    # convert a time value into its timestamp representation
    index=manufacture sourcetype=3dPrinterData
    | eval boot_ts=strptime(boot_time, "%b/%d/%y %H:%M:%S"), days_since_boot=round((now()-boot_ts)/86400)
    | stats values(days_since_boot) as "uptime_days" by printer_name

    # extract parts from the time field
    sourcetype=foo
    | eval date_hour=strftime(_time, "%H")
    | eval date_wday=strftime(_time, "%w")
    | search date_hour>=9 date_hour<=18 date_wday>=1 date_wday<=5

    # push time forward or backwards from a timestamp
    index=manufacture sourcetype=3dPrinterData
    | eval boot_ts=strptime(boot_time, "%b/%d/%y %H:%M:%S"), rt=relative_time(boot_ts, "+30d"), reboot=strftime(rt, "%x")
    | stats values(reboot) as "day_to_reboot" by printer_name
    ```

    A list of time format codes can be found [here](https://docs.python.org/3/library/datetime.html#strftime-and-strptime-format-codes){target=_blank}

!!! note "use Functions lower/upper, substr, replace, len, for text manipulation"
    ```sh
    index=hr
    | eval Organization=lower(Organization), Is_In_Marketing=if(Organization=="marketing", "Yes", "No")
    | table Name, Organization, Is_In_Marketing

    index=hr
    | eval Group=substr(Employee_ID, 1, 2), Location=substr(Employee_ID, -2)
    | table Name, Group, Location

    index=hr
    | eval Employee_Details=replace(Employee_ID, "^([A-Z]+)_(\d+)_([A-Z]+)", "Employee #\2 is a \1 in \3")
    ```

### Reports and Dashboards

#### Reports

**Reports** allow people to easily store and share **search results and queries** used to make the search.

When a report is run, a fresh search is run. Save report results to speed up search see [Accelerate Reports Doc](https://docs.splunk.com/Documentation/Splunk/latest/Report/Acceleratereports){target=_blank}

##### Scheduled Reports and Alerts

**Scheduled Reports** can do weekly/monthly reports and automatically send results via emails.

Select a **saved report** and add a schedule on it. Only admin can set its **priority**.

**Alerts** are based on searches that run on **scheduled intervals** or in **real time** (by admin). It is triggered when the results of a search meet **defined conditions**.

Some alerts actions:

- create a log file with the events
- output to [lookup](#lookups), to apend or replace data in a lookup table
- send to a telemetry endpoint, call an endpoint
- trigger scripts, triggers a bash script stored on the machine
- send emails or Slack notifications
- use a webhook

#### Visulizations

Any searches that returns statistics information can be presented as **visualizations**, or charts. Charts can be based on **numbers, time, and location**. Save visualizations as a report or a dashboard panel.

Creating customized visualizations see [doc page](http://docs.splunk.com/Documentation/Splunk/latest/AdvancedDev/CustomVizDevOverview){target=_blank}

Visulizations that are availble by default and are very intuitive (bar, line, area, pie, and table charts) are not explained here.

##### Choropleth Maps

Uses **colored shadings** to show **differences in numbers over geographical locations**. It requires a compressed **Keyhole Markup Language** (KMZ) file that defines region boundries.

Splunk ships with two KMZ files, geo_us_states for US, and geo_countries for the countries of the world. Other KMZ files can be provided and used.

`geom` is the command to use to show choropleth map. See [geom command](#geom).

##### Single Value

Displays a **single number** with formatting options to add **caption, color, unit**, etc. You can use the `timechart` command to add a **trend** and a sparkline for that value.

It can also display as **gauges** which can take forms of radial, filler, or marker. There are options to format ranges and color.

`gauge` is the command to use to enable and pass in ranges. See [gauge command](#gauge).

#### Dashboards

**Dashboard** is a collection of reports or visualizations.

##### Dashboarding Tricks

!!! note "let panels listen on variables"
    Use `$variable_name$` to refer to another variable that can be controlled by a dropdown or the drilldown

!!! note "'earliest' and 'latest' from time picker"
    For a time picker variable, the earliest and latest time can be accessed through `$variable_name$.earliest` and `$variable_name$.latest`

#### Report Acceleration

Splunk allows creation of **summary** of event data, as **smaller segments** of event data that only include those info needed to fullfill the search.

Three data summary creation methods:
- **Report acceleration** - uses automatically created summaries, accelerates individual reports
    - acceleration summary basically are **stored results** populated **every 10 minutes**
        - searches must be in Fast/Smart mode
        - must include a transforming command, and having streaming command before it and non-streaming commands after
    - also stored as **file chunks** alongside indexes buckets
    - must re-build when associated knowledge objects change
- **Summary indexing** - uses **manually** created summaries, indexes **separated** from deployment
    - must use 'si'-prefixed commands such as `sichart`, `sistats`
    - search a Summary Index by using `index=<summary_index_group_name> | report=<summary_index_name>`
    - need to pay attention to avoid creating gaps and overlaps in the data
- **Data model acceleration** - accelerates **all fields** in a data model, easiest and most efficient option

