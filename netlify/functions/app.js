/* eslint-disable */
import { MongoClient } from "mongodb";

async function getClient() {
  const uri =
    "mongodb+srv://davidduru1:r@LCXDZAJmcq8C3@cluster0.f8yw7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    return client;
  } catch (err) {
    console.log(err);
  } finally {
    await client.close();
  }
}

export async function handler(event, context) {
  const client = await getClient();
  const parsedBody = JSON.parse(event.body);
  const { route, username, password, passwordStore, url } = parsedBody;
  const db = client.db("password_protect").collection("users");

  try {
    switch (route) {
      case "register":
        await client.connect();

        const matchedUser = await db.findOne({ username, password });

        if (matchedUser) {
          return {
            statusCode: 200,
            headers: {
              "Access-Control-Allow-Origin": "*", // Allow from anywhere
            },
            body: JSON.stringify({ duplicateUser: true }),
          };
        }
        await db.insertOne({ username, password, passwordStore: [] });
        return {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "*", // Allow from anywhere
          },
          body: JSON.stringify({ success: true }),
        };

      case "login":
        await client.connect();
        const res = await db.findOne({ username, password });

        if (res) {
          return {
            statusCode: 200,
            headers: {
              "Access-Control-Allow-Origin": "*", // Allow from anywhere
            },
            body: JSON.stringify({ data: res }),
          };
        }

        break;
      case "deleteRecord":
        await client.connect();
        await db.updateOne({ username }, { $set: { passwordStore } });
        const updatedDoc = await db.findOne({ username });

        return {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "*", // Allow from anywhere
          },
          body: JSON.stringify({ data: updatedDoc }),
        };

        break;
      case "addRecord":
        await client.connect();
        const res1 = await db.findOne({ username });
        res1.passwordStore.push({ url, password });

        await db.updateOne(
          { username },
          { $set: { passwordStore: res1.passwordStore } }
        );
        const user = await db.findOne({ username });

        return {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "*", // Allow from anywhere
          },
          body: JSON.stringify({ data: user }),
        };

        break;
    }
  } catch (err) {
    console.log(err); // output to netlify function log
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow from anywhere
      },
      body: JSON.stringify({ msg: err.message }),
    };
  } finally {
    await client.close();
  }
}
