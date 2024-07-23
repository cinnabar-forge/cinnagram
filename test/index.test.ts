import { expect } from "chai";
import sinon from "sinon";
import axios from "axios";

import { sendTelegramMessage } from "../src/stateless.js";

describe("sendTelegramMessage", () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should return true on successful message send", async () => {
    const axiosPostStub = sandbox.stub(axios, "post").resolves();
    const result = await sendTelegramMessage(
      "dummy_token",
      12345,
      "Hello, World!",
      "markdown",
    );
    expect(result).to.be.true;
    expect(axiosPostStub.calledOnce).to.be.true;
  });

  it("should return false on API failure", async () => {
    sandbox.stub(axios, "post").rejects(new Error("Network error"));
    const result = await sendTelegramMessage(
      "dummy_token",
      12345,
      "Hello, World!",
      "markdown",
    );
    expect(result).to.be.false;
  });

  it("should call axios.post with correct URL and payload", async () => {
    const axiosPostStub = sandbox.stub(axios, "post").resolves();
    await sendTelegramMessage("dummy_token", 12345, "Test Message", "html");
    expect(
      axiosPostStub.calledWith(
        sinon.match.string,
        sinon.match.has("chat_id", 12345) &&
          sinon.match.has("text", "Test Message") &&
          sinon.match.has("parse_mode", "html"),
      ),
    ).to.be.true;
  });

  it("should log error on failure", async () => {
    const consoleErrorStub = sandbox.stub(console, "error");
    sandbox.stub(axios, "post").rejects(new Error("Failed to send"));
    await sendTelegramMessage(
      "dummy_token",
      12345,
      "Hello, World!",
      "markdown",
    );
    expect(
      consoleErrorStub.calledWith(
        sinon.match.string,
        sinon.match.instanceOf(Error),
      ),
    ).to.be.true;
  });
});
