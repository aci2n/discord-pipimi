import { Database } from "bun:sqlite";
const db = new Database("db.sqlite3");

const runQuery = (json: any) => {
  return db.query(json.query);
}

export default {
    port: 3000,
    async fetch(request: Request) {
      switch (request.method.toUpperCase()){
        case "POST": 
          return new Response(runQuery(await request.json()));
        case "GET": 
          const params = (new URL(request.url)).searchParams;
          const query = params.get("query");
          return new Response(JSON.stringify(db.query(query).get()));
      } 
      return new Response("Ignored");
    },
  };