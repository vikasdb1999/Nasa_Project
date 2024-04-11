const request = require("supertest");
const app = require("../../app")


describe('TEST GET /launches',()=>{
   test("It should respond success 200.",async ()=>{
    const response = await request(app).get("/launches")
    .expect("Content-Type",/json/).expect(200)
   });
});

describe('Test POST /launches',()=>{
    const completeLaunchData =  {
        mission: "ISRO",
        rocket: "Test",
        destination: "MARS",
        launchDate: "January 14, 2028"
    }
    const launchDataWithoutDate =  {
        mission: "ISRO",
        rocket: "Test",
        destination: "MARS",
    }
    const launchDataWithInvalidDate = {
        mission: "ISRO",
        rocket: "Test",
        destination: "MARS",
        launchDate: "Jan"
    }
    test('It should respond with 200 success',async ()=>{
      const response = await request(app).post("/launches").send(
       completeLaunchData
      ).expect('Content-Type',/json/).expect(201);
      const requestDate = new Date(completeLaunchData.launchDate);
      const responseDate = new Date(response.body.launchDate)
      expect(responseDate).toStrictEqual(requestDate)

      expect(response.body).toMatchObject(launchDataWithoutDate)
    })   
    test("It should catch missing properties",async ()=>{
        const response = await request(app).post("/launches").send(
            launchDataWithoutDate
           ).expect('Content-Type',/json/).expect(400);
         expect(response.body).toStrictEqual({
            error: "Missing required launch property"
        })
    })
    test("It should catch Invalid Dates",async()=>{
        const response = await request(app).post("/launches").send(
            launchDataWithInvalidDate
           ).expect('Content-Type',/json/).expect(400);
         expect(response.body).toStrictEqual({
            error: "Not Valid Date"
        })
    })
})