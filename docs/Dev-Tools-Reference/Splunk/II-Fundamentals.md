---
layout: note_page
title: Begin to Advanced Splunk II
title_short: splunk_notes_advanced
dateStr: 2020-01-01
category: Tool
tags: notes reference check
---

## Splunk 7 Fundamentals II (IOD)

This course focuses on _searching_ and _reporting_ commands as well as on the _creation of knowledge objects_.

Major topics include using _transforming commands_ and _visualizations_, _filtering and formatting results_, _correlating events_, _creating knowledge objects_, using _field aliases_ and _calculated fields_, creating _tags and event types_, using _macros_, creating _workflow actions and data models_, and normalizing data with the _Common Information Model_ (CIM).

<br/>

### Module 1 Intro

Splunk Search Terms:

- Keywords, any keywords can be searched on; "AND" boolean is implied for multiple keywords
- Booleans, AND OR NOT
- Phrases, keywords surrounded by ""
- Fields, key=value pair search
- Wildcards, used in keywords and fields to match any chars; inefficient if used at the beginning of a word
- Comparisons, = != < <= > >=

The frequently used commands can be reviewed in last part.

<br/>

### Module 2 Beyond Search Foundamentals

Go over why we want to searh in some specific ways in some situations.

- search terms, command names, function names are NOT case-sensitive.
  - exception is when using commands like _replace_, search term must be an exact match
  - field values from a Lookup are case sensitive by default

**Why Time** is the most efficient way to improve queries

- Splunk stores data in buckets (directories) containing raw data and indexing data
  - Splunk buckets have maximum size and maximum time span
- Three kinds of searchable buckets: hot, warm, cold
  - hot buckets: only writable buckets. It rolls back to warm bucket when Max size or time span reached, or indexer is restarted. It will be closed and renamed upon rolling to warm bucket.
  - warm buckets are renamed to a read-only bucket with naming of youngest and oldest event timestamp. i.e. `db_1389230491_1389230488_5`. It rolls back to a cold bucket when max size or time span reached.
  - cold buckets are stored in a different location than warm/hot buckets, likely slower but cost-effective infra.
- When search is run, it go look for the right bucket to open, uncompress the raw data and search the contents inside.

**Using wildcards** when to use and when to avoid

- using wildcard at the beginning of a word cause Splunk to search all events which causes degradation in performance.
- using wildcard in the middle of a string might cause inconsistent results
  - due to the way Splunk indexes data that contains punctuation, avoid using wildcards to match punctuation
- always best to make search as specific as possible, say `status=failure` instead of `status=fail*`

**Search Modes** use the right search mode helps improve the search speed and better access the data

- fast mode emphasis on performance and returns only essential data
  - non-transforming search will extract only fields required for the search
- verbose mode emphasizes completeness and returns all fields and event data
  - the field discovery comes at a cost of searching time
- smart mode returns the best results for the search being run

**Best Practices**

- The less data you have to search, the faster Splunk will be
- The order of effectiveness in filtering data:
  - time > index > source > host > sourcetype
  - they are extracted at index time so won't add time to extract at search time
  - use them to filter as early as possible in your search
- use the `fields` command to extract only the fields you need, as early as possible
- inclusion ("KEYWORD") is better than exclusion (NOT "KEYWORD").
- use appropriate search mode
- use Job Inspector to know the performance of the searches and determine which phase of the search too the most time
  - any search that has not expired can be inspected by this tool
  - accessible in the search results page, Job -> Inspect Job
  - https://docs.splunk.com/Documentation/Splunk/latest/Search/ViewsearchjobpropertieswiththeJobInspector

<br/>

### Module 3 Commands for Visualizations

Any search that returns statistics value can be visualized as charts.

The **Chart Command**

- any stats function can be applied to the chart command
- can take two clauses: `over` and `by`
  - `over` tells Splunk which fields you want to be on the X axis; Y axis should always be the numerical value. i.e. `index=web sourcetype=access_combined status> 299 | chart count over status`
  - use `by` when we want to split the data by an additional field. i.e. `index=web sourcetype=access_combined status> 299 | chart count over status by host`
  - only one field can be used at a time for the `by` clause when using the `over` clause, unlike in stats command.
  - If more than one field is supplied to `by` clause without `over` clause, the first field is used as with a `over` clause. i.e. `index=web sourcetype=access_combined status> 299 | chart count by status, host`
- can use argument like `usenull=f` to ignore events with NULL value in the selected fields
  - might be more efficient to remove events with NULL value in those fields before piping into a command.
- chart is limited to display 10 columns by default, others will show up as an "other" column in the chart visualization. Can be turned off by passing an argument `useother=f`
  - use `limit=5` to control the max number of columns to display, or `limit=0` to display all columns

The **Timechart Command** performs stats aggregations against time, and time is always the x-axis

- like chart, any stats function can be applied to this command, and only one value can be supplied to the `by` clause. i.e. `index=web sourcetype=vendor_sales | timechart count by product_name`
- `useother` `usenull` and `limit` arguments are also available to this command.
- this command determines the time intervals from the time range selected.
  - can change the timespan by using an argument `span=12hr`

The **Timewrap Command** allows you to compare the data further over an older time range

- specify a time period to apply to the result of a timechart command, then display series of data based on this time periods, with the X axis display the increments of this period and the Y axis display the aggregated values over that period
- i.e. `index=sales sourcetype=vendor_sales product_name="Dream Crusher" | timechart span=1d sum(price) by product_name | timewrap 7d | rename _time as Day | eval Day=strftime(Day, "%A")`
- `strftime` is a handy function to format _time into something intuitive. i.e. `strftime(_time,"%m-%d %A")`

Creating customized visualizations http://docs.splunk.com/Documentation/Splunk/latest/AdvancedDev/CustomVizDevOverview

<br/>

### Module 4 Advanced Visualizations

Splunk has commands to extract geographical info from data and display them in a good format.

The **Iplocation Command** lookup and add location information to events.

- data like city, country, region, latitude, and longitude can be added to events that include external ip addresses
- depending on the ip, not all location info might be available
- i.e. `index=web sourcetype=access_combined action=purchase status=200 | iplocation clientip`

The **Geostats Command** allows aggregates geographical data for use on a map visualization

- uses the same stats info like the _stats_ command
- i.e. `index=sales sourcetype=vendor_sales | geostats latfield=VendorLatitude longfield=VendorLongitude count by product_name globallimit=4`
- can be used in combination with _iplocation_ command

**Choropleth Maps** uses colored shadings to show differences in numbers over geographical locations

- needs a compressed Keyhole Markup Language (KMZ) file that defines region boundries
- Splunk ships with two KMZ files, geo_us_states for US, and geo_countries for the countries of the world
- other KMZ files can be used
- the **Geom Command** is the command to use to show choropleth map
  - it adds fields with geographical data structures matching polygons on map
  - i.e. `index=sales sourcetype=vendor_sales | stats count as Sales by VendorCountry | geom geo_countries featureIdField=VendorCountry`
  - the above example uses a field that maps back to the country name in the featureCollection

**Single Value Visualizations** when the results contain a single value, two types of visualizations can be used

- **single value graph** displays a single number, with formatting options to add caption, color, unit, ...
  - can also use the _timechart_ command to add a trend and a sparkline for that value
  - this will allow you to get info of this value compare to previous time period
  - search time range is related; formatting can change the time samples
- **gauges**, can be a radial, filler, or marker gauages provides a cooler visualization
  - can use format to set ranges, color; and able to swtich between the three types of gauges without losing them
  - can also be enabled by using _gauge_ command and pass in the ranges like `| gauge total 0 3000 6000 7000`

The **Trendline Command** computes moving averages of field values, gives a good understanding of how the data is trending

- three requred arguments: trendtype time-period field-for-calculation
- trendtypes
  - simple moving average (sma): compute the sum of data points over a period of time
  - expoential moving average (ema): assigns a heavier weighting to more current data points
  - weighted moving average (wma): assigns a heavier weighting to more current data points
- time-period for averaging the data points, an integer between 2 to 10000, and its unit depends on the time range of the search
- i.e. `index=web sourcetype=access_combined | timechart sum(price) as sales | trendline wma2(sales) as trend`
  - here the trendtype=wma time-period=2 field=sales

**Field Format** do styling changes of statistical tables

- wrap results, show row numbers, change click selection, or add data overlay (heat map or hightlight min/max)
- summary with totals or percentages

The **Addtotals Command** computes the sum of all numeric fields for each event (row) and creates a 'total' column

- i.e. `index=web sourcetype=access_combined | chart sum(bytes) over host by file | addtotals col=true label="Total"`
- will create a "Total" column in the results,
  - column name can be override with `fieldname="Total by host"`
  - can be removed by setting `row=false`
- the `col=true` creates another row that contains volumn totals
  - accepts a label name and a field variable `label=TOTALS labelfield=<field_name>`
  - can pass in the column names to select those to calculate totals

<br/>

### Module 5 Filtering and Formatting

The **Eval Command** for calculate and manipulate field values

- arithmetic, concatenation, and boolean operators are supported
- results can be written to a new field or override existing field vlaues
- fields values created are case-sensitive
- i.e. `index=network sourcetype=cisco_wsa_squid | stats sum(sc_bytes) as Bytes by usage | eval bandwidth = round(Bytes/1024/1024, 2) | sort -bandwidth | rename bandwidth as "Bandwidth (MB)" | fields - Bytes`
  - creates a new field 'bandwidth' with rounded to 2 decimal places
  - after the eval, safe to remove fields that we don't need anymore
- Use _eval_ for mathematical functions
- Use _tostring_ function to convert numerical values to strings to join with other strings
  - can also format time for time, hexadecimal numbers, and commas for dollar numbers
  - string sort might yield different results from numerical sort, so sort numbers early or use _fieldformat_ command
- i.e. `index=web sourcetype=access_combined product_name=* action=purchase | stats sum(price) as total_list_price, sum(sale_price) as total_sale_price by product_name | eval total_list_price = "$" + tostring(total_list_price)`
- still, _eval_ creates new field values but not changing underlaying data in the index
- multiple _eval_ commands can be used in a search; subsequent _eval_ can operate on results of previous _eval_ commands
- _eval_ has _if_ function allows evaluate arguments and create values depending on the results
  - if (x,y,z)
  - x is a boolean expression
  - y will be executed if x is evaluated true
  - z will be executed if x is evaluated false
  - y and z must be double-quoted if not numerical
  - i.e. `| eval VendorTerritory=if(VendorId<4000, "North America", "Other")`
  - '*' cannot be used as wildcard in x. instead use the _like_ clause and '_' will match one char and '%' will match multiple chars
- _eval_ has _case_ function takes multiple boolean expressions and return the corresponding argument that is true
  - case(x1,y1,x2,y2,x3,y3, ...)
  - i.e. `| eval httpCategory=case(status>=200 AND status<300, "Success", status>=300 AND status<400, "Redirect", status>=400 AND status<500, "Client Error", status>=500, "Server Error", true(), "default catch all other cases")`
  - - '*' cannot be used as wildcard in x. instead use the _like_ clause and '_' will match one char and '%' will match multiple chars
- _eval_ can be used with _stats_
  - `index=web sourcetype=access_combined | stats count(eval(status<300)) as "Success", ...`
  - when _eval_ is used within a transforming command, the _as_ clause is required; double-quotes required for field values

The **FieldFormat Command** to format values without changing characteristics of underlying values

- uses same functions as the _eval_ command
- i.e. `index=web sourcetype=access_combined product_name=* action=purchase | stats sum(price) as total_list_price, sum(sale_price) as total_sale_price by product_name | fieldformat total_list_price = "$" + tostring(total_list_price)`
- now sort will still operate on original values, despite the field value was override

The **Search Command** to search terms further down the pipeline

- behaves exactly like the search terms before the first pipe, with the added benefit to filter results further down the search pipeline
- i.e. `index=network sourcetype=cisco_wsa_squid usage=Violation | stats count(usage) as Visits by cs_username | search Visits > 1`
- still best to filter as early as possible

The **Where Command** filters events to only keep the results that evaluate as true

- uses same expression syntax as _eval_ command and many of the same functions
- i.e. `index=network sourcetype=cisco_wsa_squid usage=Violation | stats count(eval(usage="Personal")) as Personal, count(eval(usage="Business")) as Business by username | where Personal > Business | where username!="lsagers" | sort -Personal`
  - without ""s, Splunk treat the argument 'lsagers' as a field, even surrounded by single-quotes!
- However, never use _where_ command when you can filter by search terms
- inside a _where_ command, '*' cannot be used as a wildcard; instead, use _like_ operator.
  - i.e. `| where product_name like "_World%"`
  - '_' will match one char and '%' will match multiple chars
  - can check null values using _isnull_ or _isnotnull_ functions
  - values are case-sensitive in _where_ evaluation

The **Fillnull Command** replaces any null values in your events

- i.e. `index=sales sourcetype=vendor_sales | chart sum(price) over product_name by VendorCountry | fillnull`
  - by default fill with '0'. Can set the fill value with `value="NULL"`

<br/>

### Module 6 Correlating Events

**Transaction** is any group of related events that span time, can come from multiple applications or hosts

- i.e. an email sent out can generate many events along the way
- i.e. visiting a website can generate many http request
  - each event represents a user generating a single http request
- the **Transaction Command**
  - takes in one or multiple fields to make transactions
  - creates two fields in the raw event: _duration_ and _eventcount_
  - duration: the time between the first and last event in the transaction
  - eventcount: number of events in the transaction
- can be used with statistics and reporting commands
- i.e. `index=web sourcetype=access_combined | transaction clientip`
  - we get a list of events that share the same clientip, for each clientip as a group of events
  - format it better with `| table clientip, action, product_name`
- _tansaction_ command definitions: maxspan, maxpause, startswith, endswith
  - maxspan: allows setting a max total time between earliest and latest events
  - maxpause: the max total time allowed between events
  - startswith: forming transactions starting with specified (terms, field values, or evaluations)
  - endswith: forming transactions ending with specified (terms, field values, or evaluations)
  - http://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Transaction
- i.e. `index=web sourcetype=access_combined | transaction clientip startswith=action="addtocart" endswith=action="purchase"`
  - we get a list of events that share the same clientip, for each clientip as a group of events
  - can put expressions inside _eval_ function
  - format it better with `| table clientip, action, product_name` by default repeated values are ordered by an alphabetic sort discounting duplicates.

**Transaction vs. Stats**

- use transactions when:
  - to see events correlated together
  - when events need to be grouped on start and end values
  - by default limit 1000 events per transaction
- use stats when:
  - to see results of a calculation
  - when events need to be grouped on a field value
  - no limit on events per transaction
  - faster and more efficient

<br/>

### Module 7 Knowledge Objects

**Knowledge Objects** like some tool to help discover and analyze data

- include data interpretation, classification, enrichment, normalization, and search-time-mapping of knowledge (Data Models)
- can be shared with permission settings, reused by multiple people and used in search
- Naming conventions
  - Suggested components: group type platform category time description
  - http://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Developnamingconventionsforknowledgeobjecttitles
  - i.e. `OPS_WFA_Network_Security_na_IPwhoisAction`
  - for a security-focused workflow action
- Permissions, three types
  - private, default for created by a User
  - specific app, only set by Power User and Admin
  - all apps, onyl set by Admin
- Managing Knowledge Objects through: Settings -> Searches, Reports, and Alerts, or Settings -> All Configurations
- **Common Information Model (CIM)** for normalizing values to a common field name across multiple indexes and sourcetypes
  - uses schema that defines standard fields b/w sources to create common base references
  - can use Knowledge Objects to help make these connections

<br/>

### Module 8 Field Extractions

**The Field Extractor** allows to use a GUI to extract fields that persist as Knowledge Objects making them reusable in searches

- Useful if the data is badly structured (not in some key=value fashion)
- fields extracted are specific to a host, source, or sourcetype and are persistent
- Two different ways a field extractor can use: regex and delimiters
  - regex: using regular expression, work well when having unstructured data and events to extract fields from
  - delimiters: a delimiter such as comma, space, or any char. Use it for things like CSV files
- Three ways to access a field extractor:
  - Settings -> Fields
  - The field sidebar during a search
  - From an event's actions menu (easiest)
- http://docs.splunk.com/Documentation/Splunk/latest/Knowledge/AboutSplunkregularexpressions

<br/>

### Module 9 Aliases and Calc Fields

**Field Aliases** give you a way to normalize data over multiple sources

- can assign one or more aliases to any extracted field and can apply them to lookups
- Good to reference CIM when creating aliases
- in GUI, Settings -> Fields -> Field aliases (add new)
  - set destination app
  - name (choose a meaningful name for the new field)
  - apply to (sourcetype, source, or host) and its matching value
  - Map fieldName=newFieldName
  - Map multiple fields by adding another field

**Calculated Field** saves frequently used calculation you would do in searches with complex _eval_ statements

- it is like a shorthand for an _eval_ pipe
- i.e. conversion between bytes to megabytes
- in GUI, Settings -> Fields -> Calculated fields (add new)
- must be based on extracted fields
  - output fields from a Lookup Table or fields generated from within a Search string are not supported

<br/>

### Module 10 Tags and Event Types

**Tags** are Knowledge Objects allow you to designate descriptive names for key-value pairs

- enable search for events that contain particular field values
- in GUI, within a search, click on an event and see the list of key=vlaue pairs
  - in actions dropdown select Edit Tags to add new tags (comma separated)
- tags are value-specific. So it doesn't make sense to do this for a field having infinite possible values!
- To search with tags, enter `tag=<tag_value>` i.e. `index=security tag=SF`
  - tag values are case-sensitive in searches
  - matches all fields that are tagged with that value
- To limit a tag value to a field do `tag::<field>=<value>`
- manage tags in Settings -> Tags

**Event Types** allows categorize events based on search terms

- save a search as "Event Type"
- use _eventtype_ in a search will return those events that matches the definition of that eventtype
  - matching eventtypes will be color-coded
- i.e. `index=web sourcetype=access_combined eventtype=purchase_strategy`
- the priority settings affects the display order of returned results

**Event Types vs. Saved Reports**

- Event Types advantages:
  - categorize events based on search string
  - use tags to organize
  - can use the "eventtype" field within a search string
  - Downside: does not include a time range
- Saved Reports advantages:
  - fixed search criteria
  - time range & formatting needed
  - share with others
  - add to dashboards

<br/>

### Module 11 Macros

**Macros** are reusable search strings or portions of search strings

- useful for frequent searches with complicated search syntax
  - can store entire search strings
  - time range independed; time selected at search time
  - can pass arguments to the search
- in GUI, Settings -> Advanced Search -> Search macros (add new)
- i.e. you saved some _eval_ expression as a macro, then used it in a search:
  - `index=sales sourcetype=vendor_sales | stats sum(sale_price) as total_sales by Vendor | ` \`convertUSD\`
  - using macro with its name surrounded by backticks
- For macro that accepts arguments
  - name: i.e. convertUSD(1)
  - arguments: argument_name
  - definition: use argument by using $argument_name$
  - validation: can ensure the argument passed in have good values
  - \`convertUSD("total_sales")\`
- ctrl-shift-E or cmd-shift-E can preview the expanded macro without running it

<br/>

### Module 12 Workflow Actions

**Workflow Actions** create links to interact with external resources or narrow search

- uses hhtp GET/POST to pass info to external source
- or pass info back to Splunk for secondary searches
- Create workflow actions
  - GUI, Settings -> Fields -> Workflow Actions (add new)
  - can create actions for GET or POST request, or open another search
  - use field as variable like `$src_ip$` in the URI
  - if data value may contain chars need to be escaped for http URL, use `$!src_ip$`
- Workflow Action created will be available in the searched events that contains that field, as "event actions"
- If creating POST action, it only allows posting key=value raw data to the url specified
  - `age=1&hello=world&src_ip=10.2.10.163`
  - like moving the http get url parameters to the request body
  - may not be useful for many use cases

<br/>

### Module 13 Data Models

**Data Models** hierarchically strucutred datasets

- three types: Events Searches Transactions
- Data Model is like a framework for the Pivot interface
  - Starting from a Root Object (can be a simple search for index and sourcetype)
  - Add Child Object (like a filter or constraint, or just something refine the search further)
  - Each Root Object or Child Object can have multiple Child Objects
- Create Data Model on GUI: Settings -> Data Models -> New Data Model
- Or create it from a valid Search -> Statistics -> Pivot -> Save as Report -> Edit Datasets
  - Root Event, enables you create hierarchies based on a set of events, commonly used
  - Root Search, builds hierarchies from a transforming search and does not benefit from data model acceleration
  - After creating Root Event:
  - Root Transaction allow you create datasets from groups of related events that span time. It uses an existing object from the data hierarchy. It also does not benefit from data model acceleration
  - Child allow you to constrain or narrow down the events in the objects above it in the hierarchical tree
- Add Field to the Data Model. Five types:
  - Auto-Extracted, fields Splunk extracts from the data
  - Eval Expression, fields created by running an eval expression on some fields
  - Lookup, fields created using existing tables
  - Regular Exp, fields created from regex on the data
  - Geo IP, fields created from Geo IP data in the events
- http://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Acceleratedatamodels

<br/>

### Module 14 The Common Information Model (CIM)

Using **CIM** to make sure we map all data to defined method and normalize data to a common language.

- data can be normalized at index time or search time
- CIM schema should be used for
  - field extractions
  - aliases
  - event types
  - tags
- Knowledge Objects can be shared globally across all apps
- Can search the datamodel with `| datamodel keywords` command
- By default, CIM Add-on will search across all indexes.
  - this can be override in the CIM Add-on setting page
- https://splunkbase.splunk.com/app/1621/
- http://docs.splunk.com/Documentation/CIM/latest/User/Howtousethesereferencetables
- http://docs.splunk.com/Documentation/CIM/latest/User/Overview
