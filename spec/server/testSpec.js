var request = require("request");
var base_url = "http://localhost:8080/";

describe("the server is started", ()=>{
  describe("GET /", ()=>{
    it("returns status code 200", (done)=>{
      request.get(base_url, function(error, response, body){
        if(!error){
          expect(response.statusCode).toBe(200);
        }
        else{
          fail(error);
        }
        done();
      });
    });
  });
});
