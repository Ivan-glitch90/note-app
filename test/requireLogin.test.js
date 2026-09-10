const { expect } = require("chai");
const sinon = require("sinon");
const requireLogin = require("../middleware/requireLogin");


describe("requireLogin middleware", () => {

    it("calls next() when the user is authenticated", () => {
        const req = { isAuthenticated: () => true };//telling the test that user is logged in
        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };
        const next = sinon.stub();

        requireLogin(req, res, next);

        expect(next.called).to.be.true;//true because the user is logged in
        expect(res.status.called).to.be.false;//false — success path only calls next(), never touches res at all.
    });

    it("error: you must be logged in to do that!",()=>{
        const req={isAuthenticated:()=>false};
        const res ={
            status:sinon.stub().returnsThis(),
            json:sinon.stub()
        };
        const next=sinon.stub();
        requireLogin(req,res,next);
expect(next.called).to.be.false; // false — user isn't authenticated, so next() must never run
expect(res.status.calledWith(401)).to.be.true; // 401 — matches requireLogin's real response for an unauthenticated request
    });

});