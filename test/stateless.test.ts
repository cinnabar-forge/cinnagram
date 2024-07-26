import { expect } from "chai";
import sinon from "sinon";
import axios from "axios";
import fs from "fs";

import {
  deleteTelegramMessage,
  doTelegramApiAction,
  sendTelegramDocument,
  sendTelegramMessage,
} from "../src/stateless.js";

describe("doTelegramApiAction", () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should return true on successful API action", async () => {
    const mockResponse = { status: 200, data: { ok: true } };
    const axiosPostStub = sandbox.stub(axios, "post").resolves(mockResponse);
    const result = await doTelegramApiAction("dummy_token", "dummy_action", {
      key: "value",
    });
    expect(result).to.be.true;
    expect(axiosPostStub.calledOnce).to.be.true;
  });

  it("should return null on API failure", async () => {
    sandbox.stub(axios, "post").rejects(new Error("Network error"));
    const result = await doTelegramApiAction("dummy_token", "dummy_action", {
      key: "value",
    });
    expect(result).to.be.null;
  });

  it("should call axios.post with correct URL and payload", async () => {
    const mockResponse = { status: 200, data: { ok: true } };
    const axiosPostStub = sandbox.stub(axios, "post").resolves(mockResponse);
    await doTelegramApiAction("dummy_token", "dummy_action", { key: "value" });
    expect(
      axiosPostStub.calledWith(
        sinon.match.string,
        sinon.match.has("key", "value"),
      ),
    ).to.be.true;
  });

  it("should log error on failure", async () => {
    const consoleErrorStub = sandbox.stub(console, "error");
    sandbox.stub(axios, "post").rejects(new Error("Failed to send"));
    await doTelegramApiAction("dummy_token", "dummy_action", { key: "value" });
    expect(
      consoleErrorStub.calledWith(
        sinon.match.string,
        sinon.match.instanceOf(Error),
      ),
    ).to.be.true;
  });

  it("should return null if response status is not 200", async () => {
    const mockResponse = { status: 404, data: {} };
    sandbox.stub(axios, "post").resolves(mockResponse);
    const result = await doTelegramApiAction("dummy_token", "dummy_action", {
      key: "value",
    });
    expect(result).to.be.null;
  });

  it("should return null if response data does not contain ok", async () => {
    const mockResponse = { status: 200, data: {} };
    sandbox.stub(axios, "post").resolves(mockResponse);
    const result = await doTelegramApiAction("dummy_token", "dummy_action", {
      key: "value",
    });
    expect(result).to.be.null;
  });
});

describe("sendTelegramMessage", () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should return message_id on successful message send", async () => {
    const mockResponse = {
      status: 200,
      data: { ok: true, result: { message_id: 123456 } },
    };
    const axiosPostStub = sandbox.stub(axios, "post").resolves(mockResponse);
    const result = await sendTelegramMessage(
      "dummy_token",
      12345,
      "Hello, World!",
      "markdown",
      { disable_notification: true },
    );
    expect(result).to.equal(123456);
    expect(axiosPostStub.calledOnce).to.be.true;
  });

  it("should return null on API failure", async () => {
    sandbox.stub(axios, "post").rejects(new Error("Network error"));
    const result = await sendTelegramMessage(
      "dummy_token",
      12345,
      "Hello, World!",
      "markdown",
    );
    expect(result).to.be.null;
  });

  it("should call axios.post with correct URL and payload", async () => {
    const mockResponse = {
      status: 200,
      data: { ok: true, result: { message_id: 123456 } },
    };
    const axiosPostStub = sandbox.stub(axios, "post").resolves(mockResponse);
    await sendTelegramMessage("dummy_token", 12345, "Test Message", "html", {
      disable_notification: true,
    });
    expect(
      axiosPostStub.calledWith(
        sinon.match.string,
        sinon.match.has("chat_id", 12345) &&
          sinon.match.has("text", "Test Message") &&
          sinon.match.has("parse_mode", "html") &&
          sinon.match.has("disable_notification", true),
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

  it("should return null if response status is not 200", async () => {
    const mockResponse = { status: 404, data: {} };
    sandbox.stub(axios, "post").resolves(mockResponse);
    const result = await sendTelegramMessage(
      "dummy_token",
      12345,
      "Hello, World!",
      "markdown",
    );
    expect(result).to.be.null;
  });

  it("should return null if response data does not contain ok or result", async () => {
    const mockResponse = { status: 200, data: { ok: false } };
    sandbox.stub(axios, "post").resolves(mockResponse);
    const result = await sendTelegramMessage(
      "dummy_token",
      12345,
      "Hello, World!",
      "markdown",
    );
    expect(result).to.be.null;
  });
});

describe("sendTelegramDocument", () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should return true on successful document send", async () => {
    const axiosPostStub = sandbox.stub(axios, "post").resolves();
    const fsReadFileStub = sandbox
      .stub(fs.promises, "readFile")
      .resolves(Buffer.from("dummy content"));
    const result = await sendTelegramDocument(
      "dummy_token",
      12345,
      "path/to/document",
    );
    expect(result).to.be.true;
    expect(axiosPostStub.calledOnce).to.be.true;
    expect(fsReadFileStub.calledOnceWith(sinon.match.string)).to.be.true;
  });

  it("should return false on API failure", async () => {
    sandbox.stub(axios, "post").rejects(new Error("Network error"));
    const result = await sendTelegramDocument(
      "dummy_token",
      12345,
      "path/to/document",
    );
    expect(result).to.be.false;
  });

  it("should log error on failure", async () => {
    const consoleErrorStub = sandbox.stub(console, "error");
    sandbox.stub(axios, "post").rejects(new Error("Failed to send document"));
    await sendTelegramDocument("dummy_token", 12345, "path/to/document");
    expect(
      consoleErrorStub.calledWith(
        sinon.match.string,
        sinon.match.instanceOf(Error),
      ),
    ).to.be.true;
  });
});

describe("deleteTelegramMessage", () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should return true on successful message deletion", async () => {
    const axiosPostStub = sandbox.stub(axios, "post").resolves();
    const result = await deleteTelegramMessage("dummy_token", 12345, 67890);
    expect(result).to.be.true;
    expect(axiosPostStub.calledOnce).to.be.true;
  });

  it("should return false on API failure", async () => {
    sandbox.stub(axios, "post").rejects(new Error("Network error"));
    const result = await deleteTelegramMessage("dummy_token", 12345, 67890);
    expect(result).to.be.false;
  });

  it("should log error on failure", async () => {
    const consoleErrorStub = sandbox.stub(console, "error");
    sandbox.stub(axios, "post").rejects(new Error("Failed to delete message"));
    await deleteTelegramMessage("dummy_token", 12345, 67890);
    expect(
      consoleErrorStub.calledWith(
        sinon.match.string,
        sinon.match.instanceOf(Error),
      ),
    ).to.be.true;
  });
});
