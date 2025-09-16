import React from "react";
import { screen, render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Modal from "../Modal";
import CodeBox from "../CodeBox";

describe("Modal tests", () => {
  describe("Modal Component tests", () => {
    it("should render the children", () => {
      render(
        <Modal show={true} onClose={() => {}}>
          test
        </Modal>
      );
      expect(screen.getByText("test")).toBeInTheDocument();
    });

    it("should not render the children", () => {
      render(
        <Modal show={false} onClose={() => {}}>
          test
        </Modal>
      );
      expect(screen.queryByText("test")).not.toBeInTheDocument();
    });
  });

  describe("CodeBox Component tests", () => {
    it("should render the code box with content", () => {
      const { container } = render(
        <CodeBox language="javascript" code="console.log('Hello World');" />
      );
      // Find the code block and check its text content
      const codeBlock = container.querySelector("code");
      expect(codeBlock).toBeTruthy();
      expect(codeBlock?.textContent).toContain("console.log('Hello World');");
    });

    it("should render '📋 Copy All' ", () => {
      render(
        <CodeBox
          code="console.log('Hello World');"
          language="javascript"
        ></CodeBox>
      );
      expect(screen.getByText(/📋 Copy All/)).toBeInTheDocument();
    });

    it("should render '✔ Copied' after you click '📋 Copy All' ", async () => {
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
      });

      render(
        <CodeBox
          code="console.log('Hello World');"
          language="javascript"
        ></CodeBox>
      );
      const copyButton = screen.getByText(/📋 Copy All/);

      fireEvent.click(copyButton);
      expect(await screen.findByText(/✔ Copied/)).toBeInTheDocument();
    });
  });
});
