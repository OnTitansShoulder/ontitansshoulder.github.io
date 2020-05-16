---
layout: note_page
title: "MongoDB: Aggregation"
title_short: mongodb_aggregate
dateStr: 2016-12-01
category: Database
categories: notes reference
---
# Mongo Notes Chapter 5 Aggregation

Some frequently used operations:

$**project** - reshape - 1:1 - '**SELECT**'

$**match** - filter - n:1 - '**WHERE, HAVING**'

$**group** - aggregate - n:1 - '**GROUP BY**'

$**sort** - sort - 1:1 - '**ORDER BY**'

$**skip** - skips - n:1

$**limit** - limits - n:1 - '**LIMIT**'

$**unwind** - normalize - 1:n

$**out** - output - 1:1

$**redact** ?

$**geonear** ?

### $group

```
db.collection_name.aggregate([{
    $group: {
        _id:"$manufacturer",
        num_products:{$sum:1} # use {$sum:"$price"} to sum prices
    }
}]) # the above _id key value can also be:
{
"manufacturer":"$manufacturer",
"category":"$category"
}
```

$**sum**    -    `sum_price:{$sum:"$price"}`     - '**SUM(), COUNT()**'

$**avg**    -    `avg_price:{$avg:"$price"}`    - '**AVG()**'

$**min** - '**MIN()**'

$**max** - '**MAX()**'

$**push** # for grouping. Add to list, doesn't check existance.

$**addToSet** # for grouping. Add to list, checks if the item already exists.

The above operators are similar in usage, just include something like:
     `categories: {$addToSet:"$category"}`

$**first** # for sort

$**last** # for sort

### Double grouping

Nested grouping, when we need to group something based on the result from grouping something.

```python
db.collectionName.aggregate([
    {'$group':{'_id':{'class_id':'$class_id', 'student_id':'$student_id'}, 'average':{'$avg':'$score'}}},
    {'$group':{'_id':'$_id.class_id', 'average':{'$avg':'$average'}}}
])
```

### $project

```python
db.collectionName.aggregate([
    {$project:{
        _id:0, # don't want _id field. 0 means discard it, 1 means keep it.
        'maker': {$toLower:"$manufacturer"},
        'details': {'category': "$category", 'price': {"$multiply":["$price",10]}},
        'item': '$name'
    }}
])
db.zips.aggregate([
    {$project:
     {
    first_char: {$substr : ["$city",0,1]},
     }
   }
])
```

### $match

Pre aggregation filter; filter the results
```python
db.collectionName.aggregate([
    {$match:{
        'state':"CA"
    }},
    {$group:{
        '_id':"$city",
        'population': {$sum:"$pop"},
        'zip_codes': {$addToSet: "$_id"}
    }},
    {$project:{
        '_id': 0,
        'city': "$_id",
        'population': 1,
        'zip_codes':1
    }}
])
```

### $text - full text search on text index

```python
db.collectionName.aggregate([
    {$match:
        {$text: {$search: "tree rat"} # $text only allowed here
    }},
    {$sort:
        {score: {$meta: "textScore"}
    }},
    {$project:
        {words: 1, _id:0 }
    }
])
```

### $sort

can be before/after $group. use 1 for ascending, -1 for descending.

### $skip and $limit

skip first, then limit. Make sense to include after $sort or others.

### $first and $last

```python
db.collectionName.aggregate([
    {$group: {
        _id: {state:"$state", city:"$city"},
        population: {$sum:"$pop"}
    }},
    {$sort: {
        "_id.state":1,
        "population":-1
    }},
    {$group: {
        _id:"$_id.state",
        city: {$first: "$_id.city"},
        population: {$first: "population"}
    }},
    {$sort: { "_id":1}}
])
```

### $unwind - unjoin document

```python
db.collectionName.aggregate([
    {"$unwind":"$tags"},
    {"$unwind":"$sizes"}, # double unwind, like cross product. Do this if there are mroe than one arrays that need to break and create combinations
    {"$group":...}
])
```

### $out - redirect the output of aggregation

This opeator pipes the aggregation results as database. It will drop the database if it exists before!

```python
db.collectionName.aggregate([
    {"$unwind":"$tags"},
    {"$group":...},
    {$out:"summary_results"}
])
mongo < out.js
```

### aggregate options

```python
db.collectionName.aggregate([
    {"$group":...}],
    {explain: true}
) # will yield a explanation instead of the results
db.collectionName.aggregate([
    {"$group":...}],
    {allowDiskUse: true}
) # will use disk to sort instead of memory.
db.collectionName.aggregate([
    {"$group":...}],
    {cursor={}} # in Python, use this to tell mongo to return a cursor instead of one single doc. Notice in python use '=' instead of ':'.
)
```

### Limitations in Aggregation

- 100 MB limit for pipeline stages
  - get around with: allowDiskUse. but slow.
- each doc 16 MB limit by default in python.
  - use cursor={}
- sharded system -### group by, sort, will be only on one shard
