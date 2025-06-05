import express from "express";

const PORT = process.env.PORT;

async function main() {
  const app = epxress();

  app.liste(PORT, () => {
    console.log(`Listening at ${PORT}`);
  });
}

main().catch((err) => {
  console.error("Microservice failed to start.");
  console.error((err && err.stack) || err);
});
