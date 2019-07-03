---
layout: notes
title: "MongoDB: Performance"
title_short: mongodb_performance
dateStr: 2016-12-01
category: Database
categories: notes
---
# Mongo Notes Chapter 4 Performance

### Use storage engine

```python
killall mongod
mkdir WT # for wired tiger
mongod -dbpath WT -storageEngine wiredTiger # this will start mongod server with wired tiger engine.
```

### Indexes

Using indexes to help search items faster. Index is not free.
Writes: slower;
Reads: faster
given (a, b, c) indexed, you can search:
a
a, b
a, b, c
c   -- no
c, b --no
a, c  -- partially a used index, but not c
You can avoid updating indexes while inserting data by, insert bulk data first, then build the index.

```python
db.students.createIndex({attributeName: 1 (for ascending), -1 (for descending)});
db.students.explain().find(...); # will explain and gives details about this query
db.students.explain(true).find(...); # will explain and gives even more details about this query, as well as running this query.
db.students.getIndexes(); # gives a list of all indexes.
db.students.dropIndex({indexKey:1}); # delete one specific index
```

Multikey indexes, index that are created on arrays
only one of the key can be array type. Cannot have more than one compound key.

```python
db.foo.createIndex({a;1, b:1}); # multikey index
db.foo.find({a:3, b:5});
db.foo.createIndex({'work_history.company':-1}); # use dot notation to create index berried deep
```

Cannot have one entry that is both a compound index and is an array.

### Unique Index

```python
db.stuff.createIndex({thing:1}, {unique:true}); # this enforces the key to be unique in the collection
```

### Sparse Indexes

```python
db.employees.createIndex({cell:1}, {unique:true, sparse:true}); # allows some entries to not have a cell
#cannot be used with sort. Because mongo knows there are entries don't have a cell
```

### Create index in background

```python
db.students.createIndex({'scores.score':1}, {background: true}; # this allows to access the same collection while the mongo is creating the index. So not block. Otherwise it will block the collection.
# background index creation takes longer
```

### explain()
explain will give more information about the query that is about to run. It does not actually bring in the query data, but rather simulate and get some stats, and it is very useful.

```python
db.foo.explain().find()/.update()/.remove()/.aggregate()/.help()
```

- [ ] execution stats mode on explain()

```python
var exp = db.example.explain("executionStats"); # will show the execution stats for the winning plan
```

- [ ] all plans execution mode on explain()

```python
var exp = db.example.explain("allPlansExecution"); # it runs all possible plan parallel and remember the one that is fastest.
```

**Covered query** - a query that the result is returned base on keys sololy
To make a query covered, _id has to be silenced and the keys has to be explicitly shown.

```python
index: {name: 1, dob:1}
db.example.find({name: {$in: ["Bart","Homer"]}}, {_id: 0, dob: 1, name: 1});
```

### Geospatial indexes

Make sure to have:

```python
'location': [x, y] # collection schema has this field
db.collectionName.ensureIndex({"location": '2d', type: 1 (means ascending)});
find({location: {$near: [x, y]}}).limit(5);
```

- [ ] Spherical Geospatial indexes

create a 2dsphere index

```python
{
    "_id":{
        "$oid":"535471aaf28b4d8ee1e1c86f"
    },
    "store_id":8,
    "loc":{
        "type":"Point",
        "coordinates":[
            -37.47891236119904,
            4.488667018711567
        ]
    }
} # a sample schema that works with Spherical Geospatial index
db.places.find({
    location: {
        $near: {
            $geometry: {
                type: "Point",
                coordinates: [-122, 38] # longitude, latitude
            },
            $maxDistance: 2000
        }
    }
}).pretty();
```

### Text Indexes for full text search

```python
db.sentences.ensureIndex({'words': 'text'}); # add text index
db.sentences.find({$text: {$search: 'dog moss ruby'}}); # do the search, find those have dog or moss or ruby. and it is case insensitive.
db.sentences.find({$text: {$search:'dog tree obsidian'}}, {score: {$meta: 'textScore'}}).sort({score: {$meta: 'textScore'}}); # will sort the results based on relevance
```

### Index efficiency

Sometimes need to hint on the index to use to improve efficiency. For example,
if we have indexes on student_id and class_id, although using student_id and class_id will allow the in database sort, it has to exmine much larger set of data and therefore is slower.

```typescript
db.students.find({student_id: {$gt: 500000}, class_id: 54}).sort({student_id: 1}).hint({class_id:1}) // use hind to instruct mongo to use specific index
```

After we hinted the key to use, it will first filter the class_ids and then do an in-memory sort. This way is faster since the data set is much smaller. This is some trade off depend on the query needs.

- [ ] If a 'sort' stage appears in the winning plan, it means it is doing an in-memory sort

```typescript
db.students.find({student_id: {$gt: 500000}, class_id:54}).sort({final_grade: 1})
```

in this case, having a new index ({class_id:1, final_grade:1, student_id:1}) will be much faster. Why?
first, using class_id can eliminate the most records. Then using the final_grade to pick records in sorted order and prevents an in-memory sort. At the same time, the student_id is compared to the range and eliminate more records. With this, a database sort saves a lot of time.

### Logging and Profiling

The default log logs slow queries. It does this for queries that is above 100ms.

### Profiler

System.profile. Three levels:
0 - default (off)
1 - log slow queries
2 - log all my queries (good for debugging)

```typescript
mongod -dbpath /some/path/ --profile 1 --slowms 2

db.system.profile.find() // all logs
db.system.profile.find({ns:/test.foo/}).sort({ts:1}).pretty() // test db, test collection. ns stands for name space, and ts stands for timestamp.

db.setProfilingLevel(1,4) // sets profiling level in mongo shell, use level 1 and slowms 4ms. use getProfilingStatus() to see the setting.
```

### MongoTop

use mongotop to see the overall database read/write speed stats, and identify what is slowing the db down.

```typescript
mongotop 3 // command line
```

### MongoStat

```typescript
mongostat // will listen the 27017 port mongo by default. use --port to change it
```

### Sharding

use mongo server replica to distribute the traffic.
