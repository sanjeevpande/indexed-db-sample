const DB_NAME = 'test-db16';
const DB_VERSION = 1;
const DB_STORE_NAME = 'locals';

var db;

function openDb() {
    console.log("openDb ...");
    var req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onsuccess = function (evt) {
      // Better use "this" than "req" to get the result to avoid problems with
      // garbage collection.
      // db = req.result;
      db = this.result;
      console.log("openDb DONE");
    };
    req.onerror = function (evt) {
      console.error("openDb:", evt.target.errorCode);
    };

    req.onupgradeneeded = function (evt) {
      console.log("openDb.onupgradeneeded");
      var store = evt.currentTarget.result.createObjectStore(
        DB_STORE_NAME, { keyPath: 'dummyid', autoIncrement: true });
    };
}

/**
* @param {string} store_name
* @param {string} mode either "readonly" or "readwrite"
*/
function getObjectStore(store_name, mode) {
	var tx = db.transaction(store_name, mode);
	return tx.objectStore(store_name);
}

function addDummyData() {
    console.log("addDummyData arguments:", arguments);
    var obj = {'dummyid': 'dummyvalue'};
    var store = getObjectStore(DB_STORE_NAME, 'readwrite');
    var req;
    try {
      req = store.add(obj);
    } catch (e) {
      if (e.name == 'DataCloneError')
        displayActionFailure("This engine doesn't know how to clone a Blob, " +
                             "use Firefox");
      throw e;
    }
    req.onsuccess = function (evt) {
      console.log("Dummy Insertion in DB successful");
    };
    req.onerror = function() {
      console.error("Dummy addData error", this.error);
    };
}


function addData(key, value) {
    console.log("addData arguments:", arguments);

    var objectStore = getObjectStore(DB_STORE_NAME, 'readwrite');
    
    var request = objectStore.get("dummyvalue");

    request.onerror = function(event) {
	  // Handle errors!
	  console.log('12');
	};
	request.onsuccess = function(event) {
		// Get the old value that we want to update
	  	var data = event.target.result;
	  
	  	// update the value(s) in the object that you want to change
	  	data.dummyKey2 = 'dummyValue2';

	  	// Put this updated object back into the database.
	  	var requestUpdate = objectStore.put(data);
	   	requestUpdate.onerror = function(event) {
	    	// Do something with the error
	    	console.log('update error');
	   	};
	   	requestUpdate.onsuccess = function(event) {
	    	// Success - the data is updated!
	    	console.log('update success');
	   	};
	};
}

function getData(store) {
    console.log("getData");

    if (typeof store == 'undefined')
      store = getObjectStore(DB_STORE_NAME, 'readonly');

    var req;
    req = store.count();
    // Requests are executed in the order in which they were made against the
    // transaction, and their results are returned in the same order.
    // Thus the count text below will be displayed before the actual pub list
    // (not that it is algorithmically important in this case).
    req.onsuccess = function(evt) {
      console.log('Get result:: ', evt.target.result);
    };
    req.onerror = function(evt) {
      console.error("add error", this.error);
    };

    var i = 0;
    req = store.openCursor();
    req.onsuccess = function(evt) {
      var cursor = evt.target.result;

      // If the cursor is pointing at something, ask for the data
      if (cursor) {
        console.log("getData cursor:", cursor);
        req = store.get(cursor.key);
        req.onsuccess = function (evt) {
          var value = evt.target.result;
          console.log('Value get', value);
        };

        // Move on to the next object in store
        cursor.continue();

        // This counter serves only to create distinct ids
        i++;
      } else {
        console.log("No more entries");
      }
    };
}

openDb();
setTimeout(function() {
	addDummyData('key1', 'value1');
}, 2000);

document.getElementById('addData').addEventListener('click', function() {
	addData();
});

document.getElementById('getData').addEventListener('click', function() {
	getData()
});