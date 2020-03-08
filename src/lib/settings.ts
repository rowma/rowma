const DATABASE: string = process.env.ROWMA_DB || "inmemory";
const PORT: number = Number(process.env.ROWMA_PORT) || 3000;

export { DATABASE, PORT };
