# Vatch
Vatch is a streamlined wrapper for vanilla javascript that utilizes [telegra.ph](https://telegra.ph) as an open-source pocket database.

```javascript
// Initialize the database
const db = await Vatch("7fa055e57c3f3...");

// Create data
await db.set("users", [
  { name: "John Doe", email: "johndoe@example.com" },
  { name: "Jane Doe", email: "janedoe@example.com" }
]);

// Retrieve data
console.log(db.get("users"));
```

# Installation
```html
<script src="https://cdn.jsdelivr.net/gh/creuserr/vatch/dist/vatch.min.js"></script>
```

# Documentation
## Structure Concept
Each database has its own data, and each data contains a JSON-compatible value.

## Initializing the Database
To initialize the database, use the asynchronous function `Vatch(<ACCESS TOKEN>)`.

For a new database, leave the access token field blank.
```js
// Creates a new database
const db = await Vatch();
```

For an existing database, provide the access token.
```js
// Use an existing database
const db = await Vatch("7fa055e57c3f3...");
```

## Modifying/Creating Data
To modify or create data, use the asynchronous method `.set(<NAME>, <CONTENT>)` from a database instance.
```js
// Initialize the database
const db = await Vatch("7fa055e57c3f3...");

// Modify/Create data
await db.set("users", [
  { name: "John Doe", email: "johndoe@example.com" },
  { name: "Jane Doe", email: "janedoe@example.com" }
]);
```

## Retrieving Data
To retrieve data, use the method `.get(<NAME>)` from a database instance. Note that `.get()` is not asynchronous.
```js
// Initialize the database
const db = await Vatch("7fa055e57c3f3...");

// Retrieve data
console.log(db.get("users"))
```

## Properties
| Name | Type| Description |
|:-----:|:-----:|:-----:|
| `.access`| String| Access token of the database|
| `.agent` | String| User agent of the client who created the database |
| `.creation`| Integer | Milliseconds when the database was created|
| `.dataset` | Array String | List of created data|
| `.version` | Float | Build version of Vatch that created the database |

# Limitations
1. **No data destruction**: You cannot destroy data and unlist them. A manual mechanism for considering data as destroyed may be necessary.
2. **Not real-time update**: Pouch relies on caching, fetching data from the cache rather than the actual cloud database. Re-initializing the database may be required for updated data.
