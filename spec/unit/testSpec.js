var request = require("request");
var base_url = "http://localhost:8080/"

// describe("A suite", () => {
//   it("contains spec with an expectation", function() {
//     expect(true).toBe(false);
//   });
// });

describe("the server is started", ()=>{
  describe("GET /", ()=>{
    it("returns status code 200", (done)=>{
      request.get(base_url, function(error, response, body){
        expect(response.statusCode).toBe(200);
        done();
      });
    });
  });
});
