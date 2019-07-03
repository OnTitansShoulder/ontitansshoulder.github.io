---
layout: notes
title: "MongoDB: CRUD"
title_short: mongodb_crud
dateStr: 2016-12-01
category: Database
categories: notes
---
## Mongo Notes Chapter 1 & 2 CRUD

show dbs
use databaseName

### Insert items

```python
db.collectionName.insertOne({...}) # insert one item
db.collectionName.insertMany([{...},{...},...]) # insert might encounter duplicates and stop at error. To get over with this,
db.collectionName.insertMany([{...},{...},...], {"ordered":false})
```

### ObjectId string

ObjectId: '\_id' field having:
Date | MAC address | PID | Counter, totally 12-Byte Hex String

### Find items

```python

### To find exact matches:

db.collectionName.find({name: "value"}) #direct vield. can have "" as well
db.collectionName.find({"tomato.meter": "value"}) # key nested, has to use ""; also this nesting can go much depper, it only matches those with this field defined. If does not exist, then would not return it.
db.collectionName.find({"writers":["John","Kaisa"]}) # array order matters!
db.collectionName.find({"actors.0":"Jeff"}) # match the first element in actors array
```

### cursers

MongoDB Server returns query results in batches.
Each batch returns some items that does not make the BSON transmitted exceed 1 MB.
`var curser = db.collectionName.find({...})`
will store the curser returned.
`curser.next()`
will give next batch.

### Projection

Use projection to limit the number of items returned.
```python
db.collectionName.find({...}, {title: 1, _id: 0}) # 1 means true, yes. 0 means false. Here _id is excluded, but it is 1 by default.
```

### Comparison operators in query

```python
db.collectionName.find({count:{$gt:20}}).pretty() # gives rows that have count > 20. .pretty() makes the result easier to view.
```
- $gt (greater than)
- $lt (less than)
- $gte (greater or equal than)
- $lte (less or equal than)
- $ne (not equal)
- $in (appears in this array) supply an array
- $exists (if this field has value) supply a boolean
- $type (check field type) supply a type in ""
the above operators return things that has 'undefined' value as well.

### Logical operators in query

```python
db.collectionName.find({$or: [{"tomato.meter": {$gt: 95}}, {"metacritic": {$gt: 88}}]}) # use logical operators to combine a list of criteria
```
- $and
- $or
- $not

### Regex operators

```python
db.collectionName.find({"awards.text":{$regex: /^Won\s.*/}}) # find all rows with this field matching this regex
```

### Array operators

```python
db.collectionName.find({"genre":{$all: [...]}}) # this field has to match only if all in this array appears
db.collectionName.find({'scores': {$elemMatch: {type:'exam', score:{'$gt':99.8}}}}); # going in deeper to match
```
- $all    matches if it contains all elements in array
- $size    matches if the array field is a specified size
- $elemMatch    matches if the element in the array matches all the specified conditions !!! to distinguish from simply doing `db.collectionName.find({... : {..., ...} })`  where one of the critera matches will satisfy the condition, elemMatch forces all critera to match.

### Update options

```python
db.collectionName.updateOne({...: ... filtering out rows}, {$set: {...: ... new values, ...: ...}}) # this will modify the first item that matches, and only if the matching field exists, otherwise add the field if it does not exist
```
- $inc  # increase value
- $rename
- $setOnInsert
- $set
- $unset
- $min
- $max
- ... see more in documentation

```python
db.collectionName.updateMany({...: ... filtering out rows}, {$set: {...: ... new values, ...: ...}})
```

### Upserts

```python
db.collectionName.updateOne({...: ... filtering out rows}, {$set: {...: ... new values, ...: ...}, {upsert: true}}) # will be helpful if you want to insert something, but is afraid that it exists, then this query will: update it if it finds it; or insert it if it doesn't.
```

### Replace

```python
db.collectionName.replaceOne({"imdb": detail.imdb.id (matching criteria)}, detail (the new candidate)) # replace one thing with another document
```

### Commandline techniques

`cat someJsonFile.json | python3 -m json.tool | more      # this will 'prettify' the raw json`

### Python techniques

```python
import json
import urllib2
import pymongo
connection = pymongo.MongoClient("mongodb://localhost:27017")
db = connection.DBName
collection = db.CollectionName
pageLoad = urllib2.urlopen("https://...url...")
parsed = json.loads(pageLoad.read())
for item in parsed['key']['children']:
    #do something

netstat –p -i
```

### Perform CRUD:

```python
collection.find_one()
#find_one, find, insert_one, insert_many, update_one, update_many, replace_one, delete_one, delete_many
### order of methods: find -> sort -> skip -> limit
cursor = socres.find(query).sort('id', pymongo.ASCENDING).skip(5).limit(5)
# notice, the pymongo doesn't quite run the query until the cursor get iterated.
```

### HW

```python
db.grades.find({score:{'$gte':65}}).sort({score:1}) # mongo cli
collection.find().sort('field', pymongo.ASCENDING) # Pymongo
```
