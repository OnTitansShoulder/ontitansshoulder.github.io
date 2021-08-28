---
layout: note_page
title: Splunk Dashboarding
title_short: splunk_dashboarding
dateStr: 2021-08-01
category: Tool
tags: notes reference check
---

Notes taken from Splunk official trainings. It serves as a quick reference for Splunk Dashboard creation and tricks.

Dashboard view are webpages driven by simple XML for their contents, HTML for their layout, and CSS and JavaScript to define appearance and interactions.

Any searches that return statistical data (from using [transforming commands](https://docs.splunk.com/Documentation/Splunk/7.3.1/Search/Aboutreportingcommands){target=_blank}, i.e. `stats chart timechart top rare`) can be displayed as visualization in a dashboard.

## Making a Plan

Splunk Dashboard serves a team audience. It can be used by engineers, stakeholders, devops, and customer support.

Some questions worth getting clear answers before creating a dashboard:

- What are the end users and their skill level?
- Which metrics are critical to individual roles?
- What is the timespan of the data and how frequent it should refresh?
- What types of visualizations are required? Layout?
- Will users access this dashboard through Splunk or in a web app?
- Do you need custom stylesheet to define parameters for the visualizations? Javascript for additional interactivity?

The important part of planning to to sketch out the dashboard's wireframes. Think about the panels you will need, types of visualizations, data you want, how they should arrange, and how the dashboard should look in the end.

Next, plan for interactivity by adding inputs.

For the search and data, it helps to create a chart listing the data group, the source type, and interesting fields. i.e.

Type | Source type | Interesting Fields 
---- | ----------- | ------------------
Online transactions | access_combined | action, bytes, categoryId, clientip, itemId, JSESSIONID, price, productId, product_name, referer, referer_domain, sale_price, status, user, useragent 
Retail sales | vendor_sales | AcctID, categoryId, product_name, productId, sale_price, Vendor, VendorCity, VendorCountry, VendorID, VendorStateProvince 
Server access data | linux_secure | action, app, dest, process, src_ip, src_port, user, vendor_action 
Event Annotations | bcg_sale_dates | Sale_Category, Sale_Date, message 

## HTML Dashboard

At the dashboards page, you can edit a dashboard and convert it to HTML dashboard. Always do "Create New" so you have a backup to return to when running into issues.

HTML dashboards allows more customizability but cuts out editability of the dashboard contents. Learn more about it [here](https://docs.splunk.com/Documentation/Splunk/latest/Viz/ExportHTML){target=_blank}.

You can add texts, images, reference files from other apps, and use common HTML tags.

You can also directly add `<html>` tags within the dashboard source, and reference tokens within it and have it display on the dashboard. i.e.

```xml
<row>
    <panel>
        <title> Time Range: </title>
        <html>$timeInput.earliest$ to $timeInput.latest$</html>
    </panel>
</row>
```

## Edit Dashboard Source XML

Panels can have seven XML visualization elements, each of which can have their own attributes and options. Full reference is available at [here](https://docs.splunk.com/Documentation/Splunk/latest/Viz/PanelreferenceforSimplifiedXML#Working_with_visualization_elements){target=_blank}

Source XML edit allows more advanced touch to the dashboard to improve efficiency, make appearance consistant cross panels, make more complex interactivity, 

```
<chart>
<event>
<map>
<single> single value
<table>
<viz> custom visualization
<html> html 
```

Three types of dashboard panels:

- report
- inline
- prebuilt can be referenced by multiple dashboards where they show the same view
    - can be created from existing panels
    - prebuilt panels can be accessed by Settings -> User interface -> Prebuilt panels
    - edit prebuilt panels in XML

Note panel refresh is only available to report and inline panels.

!!! warning "Prebuilt panels"
    Avoid searches using knowledge objects when creating prebuilt panels, such as event types, tags, lookups. This is because all users may not have access to the same knowledge objects.

## Add custom stylesheets and logic

You can add on top of the dashboard XML with CSS, HTML, Javascript, using third-party libraries to add custom behaviors, graphics, and layouts. This can be very labor intensive, however.

## Dashboard Forms

We can create user input widgets to take in form values, which are stored as tokens. Then tokens can be used as arguments in panels created by inline searches.

Dashboard that has no inputs are wrapped in `<dashboard>` tags, while dashboard that has inputs are wrapped in `<form>` tags.

### Tokens

Tokens represent variables whose value changes dynamically. It is used to pass search terms and field values to individual or multiple dashboard panels. 

Tokens can also be used for event handlers which listen for actions and respond with configured behaviors, such as showing/hiding a dashboard panel, useful for configuring drill downs.

Tokens can be pre-defined or user-defined. More about [dashboard tokens](https://docs.splunk.com/Documentation/Splunk/latest/Viz/tokens){target=_blank}.

#### Time Input

Time input can be created as a time picker, which creates a token for panels searches to reference and affect the duration covered by the search. You can do so easily through the UI. Or from XML:

```xml
<fieldset>
    <input type="time" token="timeInput">
        ...
        <default>
            <earliest>-7d@d</earliest>
            <latest>now</latest>
        </default>
    </input>
</fieldset>
...
<search>
    <query>...</query>
    <earliest>$timeInput.earliest$</earliest>
    <latest>$timeInput.latest$</latest>
</search>
```

If the time input is not given a token name, it is regarded as the global time picker. The panels without a time selected will use the global time by default. And its XML will show

```xml
<search>
    <query>...</query>
    <earliest>$earliest$</earliest>
    <latest>$latest$</latest>
</search>
```

Note that `earliest` and `latest` in the search query still overrides the time picker. It can be useful to put the same panel side-by-side but only allow timerange selection to change on the right panel to allow comparison.

A time input can be put within a panel to denote it controls time for that panel (even though the token created is still sharable by other panels). You can still reference the time token within the Panel title to let it reflect the time selected.

#### Text Input

Manually supply any value to a field token that can be used by panels searches.

This token is useful to replace query where a search condition has wildcard match in it, so that the text token can be used instead for filtering data for the panel.

It is good to prefix and suffix the token value with `"` in the search string so the token value can contain spaces.

Default value overides initial value.

#### Dropdown Menu

Supply selectable values to users, whose values set is also searchable. Options can be static or from a search.

There are ways to improve the user experience for the dropdown, such as sort the options alphabetically, list the options sorted by the frequency of appearance.

#### Multiselect Input

Allows user simultaneously search for multiple values. The token value prefix/suffix and delimiter are particularly useful here to supply token value as multiple conditions for the search.

#### Cascading Input

Feed variables from one input dropdowns to another to narrow down data being searched by categoy. i.e. select Country Code -> State -> City.

#### Event Handler

When providing cascading inputs, it is nice to provide a way to quickly clear/reset the form. We can do so with a Radio button that has only one option, and add some `<unset>` tags to the radio button's tags. i.e.

```xml
<input type="radio" token="reset_menus_tok" searchWhenChanged="true">
    <label></label>
    <choice value="now">Reset Menus</choice>
    <default>now</default>
    <change> 
        <unset token="form.v_country_tok"></unset> 
        <unset token="form.v_state_tok"></unset> 
        <unset token="form.v_city_tok"></unset> 
        <set token="form.reset_menus_tok">no</set> 
    </change>
</input>
```

#### Token filters

Token filters allow you to manipulate and escape characters in token values.

Splunk has five default Token filters. You can create you own using JavaScript, reference [here](https://dev.splunk.com/enterprise/docs/developapps/webframework/binddatausingtokens/transformandvalidate/){target=_blank}. More examples [here](https://splunkbase.splunk.com/app/1603/){target=_blank} and Splunk [JavaScript SDK](https://dev.splunk.com/enterprise/docs/devtools/javascript/sdk-javascript/){target=_blank}

- `|s` Quote filter - You can use the `|s` operator in token to ensure it is always quoted, i.e. `$mytoken|s$`
- `|h` HTML inclusion filter - makes token values valid for HTML, such as `&amp;`
- `|u` URL encoding filter - makes token value URL escaped, such as `%20`
- `|n` - prevent any encoding to variables contained within the token wrapper, such as preventing URLs from being escaped.
- `$$` - wrap the token with second pair of `$` to prevent it from being rendered.

#### Global environment tokens

Tokens available by default and used as `$env:token_name$`. Here is a list of [global tokens](https://docs.splunk.com/Documentation/Splunk/8.0.0/Viz/tokens#Use_global_tokens_to_access_environment_information){target=_blank}.

### Customizing Dashboards

#### Table Formatting

Using the configuration options from the UI, you can make a statistics table more informative through use of Format and give it sort by field, highlights on values, and formatting on number precisions.

The same set of customization rules can be easily copied to another in the XML (Source) editor.

#### Trellis

Use of Trellis allows us visualize the data by category, and create multiple instances of a visualization without running multiple ad hoc searches.

Enabling this option may make the panel heights a bit awkward, which we can fix by giving the panel a fixed height or width, or updating the trellis size:

```xml
<option name="height">460</option>
```

#### Event Annotation

Event Annotation allow you to add labels to a dashboard panel, adding context to the data behind it.

You do this within an existing panel by editing its source XML. Add another search element with `type="annotation"`. Then within the search string, use `eval` to create `annotation_label` which allows you to use a field name to group annotations.

Event annotations require the `_time` field, so it must be available in the output of the search. The search's time range will inherit from the panel's time range unless specified otherwise in the query.

i.e.

```xml
<serach type="annotation">
    <query>
        index=...
        | eval annotation_label = "User Removed from Cart"
        | table _time annotation_label
    </query>
</search>
```

Some other useful properties can be added within the `eval` command are 

- `annotation_category`: group annotations by category
- `annotation_color`: set annotation marker color
    - alternatively can use chart option `charting.annotation.categoryColors`

#### Hiding panel links

You can choose to hide some links shown at bottom of the panel when hovering. A comprehensive list of options to show/hide can be found [here](https://docs.splunk.com/Documentation/Splunk/latest/Viz/PanelreferenceforSimplifiedXML#Shared_options){target=_blank}.

The options also allow further refine the linked search with other queries, useful for drill down more data or on a different or larger time span.

#### Drilldowns

Drilldowns allows users to run new searches and display additional details by interacting with dashboard panels.

Four types of drilldowns: Event, Visualization, Dynamic, Contextual.

**Event drilldown** involves user clicking on an event returned from a search result, allows users to

- add more terms to the search
- exclude terms
- create new search for all events containing the term

**Visualization drilldown** is under the visualization tab, users clicks directs them to the events returned by the underlying search.

**Dynamic drilldowns** allow user interactions to pass values to other searches, dashboards, reports, or external sources. This can be configured by the Drilldown editor for each panel:

- Link to Search allows using [predefined tokens](https://docs.splunk.com/Documentation/Splunk/latest/Viz/PanelreferenceforSimplifiedXML#Predefined_drilldown_tokens){target=_blank} or other tokens available in the link to search with custom search string
    - `$click.value$` token is predefined for multiple visualization types
    - when clicked, the visualization x-axis value is populated into `$click.value$` token, and the y-axis value is populated to the `$click.value2$` token

<img src="../img/predefined_tokens.PNG">

- Link to Dashboard allows further see other dashboards with more details for a specific category
    - you can pass parameters to the downstream dashboard that depends on a token
    - parameter name should be: `form.<token_name>`
    - note the global time range can be directly used in parameter: `earliest latest`
- Link to reports allows redirects to reports to prevent unwanted adhoc searches
- Link to URL allows opening a page from a relative URL (for another Splunk view) or absolute URL (for external resources)
- Change the value of tokens or set a token

A `<drilldown>` element will be add to the panel in its XML source when it is set.

**Contextual drilldowns** allow dashboard panels to listen for specific events, then trigger custom actions in response, i.e. show/hide panels.

#### Conditional Interactions

Use of drilldown and change actions depending on the fields clicked, which requires change the XML and the use of `<condition>` elements. i.e.

```xml
<drilldown>
    <condition field="Vendor Sales">
        <set token="params1">index=web</set>
        <link target="_self">/app/search/product_sales_by_source?form.Source=$params1$&amp;form.dash2time.earliest=$form.dash1time.earliest$...</link>
    </condition>
</drilldown>
```

More elements that can be used within conditions can be found at [here](https://docs.splunk.com/Documentation/Splunk/8.2.2/Viz/PanelreferenceforSimplifiedXML#condition_.28drilldown.29){target=_blank}

### Advanced Behaviors

#### Event Actions

Four types of event actions elements: `<eval> <link> <set> <unset>`

- `<eval>` works like an `eval` command, by executing an expression and storing the results in a defined field
    - it takes a component of an `eval command` and adapts for XML
    - i.e. `| eval bandwidth=round(Bytes/1024,1024,2)` becomes `<eval token="bandwidth">round(Bytes/1024,1024,2)</eval>`
- `<link>` allows setting a destination for a drilldown, input, or search.
    - destination can be a dashboard (i.e. `<link>app/search/[dashboard_name]</link>`), form (i.e. `<link>app/search/[dashboard_name]?form.token=$token$</link>`), or URL (i.e. `<link>[URL]?q=$token$</link>`)
- `<set/unset>` allows create new token values or remove a token

These event action elements must be wrapped within elements such as `<drilldown> <change> <search>`, and optionally used within the `<condition>` element.

When used with `<search>`, you can make the action dependent on the status of a search, from the event handlers `<done> <error> <fail> <cancelled> <progress>`. `<link>` can further be used with `<finalize> <preview>` elements.

Comprehensive documentation for event actions is [here](https://docs.splunk.com/Documentation/Splunk/latest/Viz/EventHandlerReference#Event_actions){target=_blank}.

#### Search Event handlers

Five types of search event handlers: `<done> <error> <fail> <cancelled> <progress>`

They can be used with predefiend tokens `$job$ $result$`.

- `$result$` token returns the value from the first row of results for the specified field
    - can be used with the `<progress>` and `<done>` elements
- `$job$` token accesses properties from the search, i.e. resultCount runDuration
    - can be used with the `<progress>` and `<done>` elements

!!! note "Example usage: show result count in the panel title"
    ```xml
    <panel>
        <chart>
            <title>Vendor Sales - $results$ events</title>
            <query>...</query>
            <earliest>...</earliest>
            <latest>...</latest>
            <done>
                <set token="results">$job.resultCount$</set>
                <eval token="runTime">tostring(tonumber($job.runDuration$),"duration")</eval>
            </done>
        </chart>
        <html>
            <p>Job Duration: $runTime$</p>
        </html>
    </panel>
    ```

#### Visualization Event Handlers

`<drilldown>` is a kind of visualization event handlers.

There is also `<selection>` which allows users to pan and zoom timerange from within an area, column, and line charts. The token produced can be used anywhere on other panels. i.e.

```xml
<chart>
    <search>...</search>
    <selection>
        <set token="selection.earliest">$start$</set>
        <set token="selection.latest">$end$</set>
    </selection>
</chart>
```

Then create other panels to listen on the tokens created by the selection. The new panel will refresh whenenver the selection changes from the first panel.

`depends` and `rejects` are attributes can be used on elements `<row> <panel> <chart> <table> <events> <input> <search>` to show/hide elements by checking whether the specified token exists. They can be used with event handlers including `<drilldown>` and `<condition>`

`depends` and `rejects` can be used together in case different combination of inputs are used to display different panels.

#### Form Input Event Handlers

The `<change>` element can be used within `<input>` to control how the dashboard responds to user inputs. The supported input types are `checkbox, dropdown, link, radio, text, time`

For example, when user selecting one input which should clear some other input, you can use `<change>` and `<unset>` to do so.

One thing to note is that tokens used in `<set> <unset>` within `<change>` should be referenced by `form.<token_name>` for it to work properly.

### Custom Visualizations

Custom visualizations can be downloaded from Splunkbase.com (or from Browse more Apps menu) or created yourself (helpful [docs](https://docs.splunk.com/Documentation/Splunk/latest/AdvancedDev/CustomVizDevOverview){target=_blank}). Installing new visualizations requires admin role.

### Simple XML extensions

Files put under `Search/Appserver/Static` can be referenced by the dashboard XML as comma-separated string. For css it is referenced as attribute `stylesheet="db_style.css"`, and for js it is `script="db_script.js"`

`dashboard.css` and `dashboard.js` will automatically be referenced without explicitly doing so in XML.

## Optimizing and Best Practices

### Power a Panel using Report

When creating dashboards, we tend to create an empty dashboard, then create panels with queries as inline search.

The dashboard is configured such that each time it loads, it runs those searches. And if the panels are configured to refresh on an interval, it does so for every panel and for every user having this dashboard opened.

This puts more pressure to Splunk as more users open the same dashboard at the same time. There is a way to let all users see the "cached" dashboard panels, given that dashboard panels are not subject to taking user inputs.

!!! note "Power a Panel using Report"
    Within the search page, save your search as [Report](https://docs.splunk.com/Documentation/Splunk/latest/Report/Schedulereports){target=_blank} (and make sure no time range picker, so it can be scheduled to run).

    Then you can immediately add a panel in the dashboard view using the Report you just created (make sure Report is selected rather than inline search).

    Now go to the Report page, configure the report just created and enable "Schedule Report", give it a recurring scheduled time to run so that each time the dashboard loads, it reuse the cached results from the scheduled Report.

### Prevent panels refresh when inactive

!!! note "onunloadCanelJobs"
    We can set a dashboard attribute `onunloadCanelJobs="true"` to prevent panels from auto refreshing when a user is navigated to a different browser tab. i.e.

    ```xml
    <dashboard onunloadCanelJobs="true">
        ...
    </dashboard>
    ```

### Load custom JavaScript

!!! note "custom JavaScript"
    You can have a dashboard load custom JavaScript by providing the attribute `script="<script_file1, script_file2 ...>"` on the dashboard root tag. This file must be present on the app server's static subfolder.

    ```xml
    <form script="customScript.js">
        ...
    </form>
    ```

### Show/Hide a panel

!!! note "Use token to control whether element renders"
    You can use `rejects` or `depends` attributes on elements to control whether it renders. Both takes a comma separated list of tokens.

    `rejects` will hide an element if one the specified tokens is defined; `depends` will show an element only if all the specified tokens are defined.

### Complete charting properties

Full [Charting Configurations](https://docs.splunk.com/Documentation/Splunk/8.0.0/Viz/ChartConfigurationReference){target=_blank} can be found on official doc. Using these options to further customize the charts.

Visualization also have shared options can be found [here](https://docs.splunk.com/Documentation/Splunk/latest/Viz/PanelreferenceforSimplifiedXML#Shared_options){target=_blank}.

### sparkline

!!! note "Add a sparkline to statistics table to show a small trend of data"
    `sparkline` is a function to use to let a statistics table showing some "snippet" of what you get from a timechart on that field.

### Panels Best Practices

- Try limit the number of panels to five on a dashboard
    - consider spreading to multiple dashboards if needed more panels
- As for Reports, saved searches, and other knowledge objects, make title as descriptive as possible
    - recommend a global naming convention for the organization
    - i.e. `<sourcetype> by <team/org> - <time_range>`
    - title length of 45 chars or less is also recommended
- Use Report-backed panels, limiting time ranges for the searches, or use more of `top` and `head` commands in the search help speed up the panel load time

You should consider power your panels with accelerated data models and using [`tstats`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Tstats){target=_blank}

### Use a Base Search

!!! note "base search and post-process search"
    When multiple panels within the dashboard have the same search terms (before the first pipe), you can pull the common part out as a base search, and reference it and keep build on top of it in other panels' searches (as post-process search). i.e.

    ```xml
    <dashboard>
        <search id="web_sales">
            <query>index=vendor-sales ... | fields vendor, sales, product_name</query>
        </search>
        <row>
            <panel>
                <chart>
                    <search base="web_sales">
                        <query>timechart count by product_name</query>
                    </search>
                </chart>
            </panel>
        </row>
    </dashboard>
    ```

    This also allows those panels sharing the same base search to make one base search to Splunk, reducing loads on Splunk deployment.

## Troubleshooting

!!! note "Check the search string"
    For inline search and Prebuilt panels, just paste the query string into a search and verify the data is expected.
    
    Also check macros that are powered by their own underlying searches. Short cut to show macro expanded is Ctrl/Command-Shift-E.

    Use `history` command to check previous searches stored as events.

    For Reports, view the report to ensure its functioning properly, note its schedule and acceleration settings.

!!! note "Check XML for illegal characters"
    Characters such as `' " < >` have special meanings in XML and should be escaped using the CDATA tags. i.e. `<!CDATA[ Steve's Games ]>`

!!! note "Use job inspector"
    Use the job inspector within the search page to see how a search was processed as well as many metrics related to the search. More see this [video](https://www.youtube.com/watch?v=n3OqaB6GVXs){target=_blank}

!!! note "Create HTML panel with tokens"
    It is useful to debug a dashboard tokens by creating a HTML panel showing all token values. i.e.

    ```xml
    <row>
        <panel>
            <html>
                <p>cat_tok_01 = $cat_tok_01$</p>
                <p>cat_tok_02 = $cat_tok_02$</p>
                ...
            </html>
        </panel>
    </row>
    ```
