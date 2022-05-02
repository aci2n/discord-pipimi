import { PipimiCommand } from "../../framework/command.js";
import process from 'process';
import child_process from 'child_process';
import { fileURLToPath } from 'url';
import axios from "axios";
import path from "path";

/**
 * @returns {PipimiCommand[]}
 */
const getOcrCommands = () => {
    const clientPromise = initClient();

    return [PipimiCommand.prefixed(["ocr"], [], async (context, args) => {
        const { message, logger } = context;
        const { channel, attachments } = message;

        if (attachments.size === 0) {
            await channel.send("No attachments found.");
            return context;
        }

        const attachment = attachments.first();
        logger.debug(() => `Getting image from ${attachment.url}`);
        const imageResponse = await axios.get(attachment.url, { responseType: "arraybuffer" });
        logger.debug(() => `Got response from ${attachment.url}`, imageResponse.headers);
        const imageBytes = imageResponse.data;
        logger.debug(() => `Image size: ${imageBytes.length} bytes`);

        const client = await clientPromise;
        const results = await client.readText(imageBytes);

        if (results.length === 0) {
            await channel.send("Could not detect any text in the image.");
            return context;
        }

        const lines = ["**OCR Results** *(confidence%)*"];

        for (const result of results) {
            const confidence = Math.round(result.confidence * 100);
            const line = `${result.text} *(${confidence}%)*`;
            lines.push(line);
        }

        await channel.send(lines.join("\n"));
        return context;
    })];
};

const initClient = () => {
    const rootDir = path.dirname(fileURLToPath(import.meta.url));
    const script = path.join(rootDir, "server.py");
    const port = 9001;
    const languages = ["ja"].join(",");
    // for docker build: remember to run once locally to download the models which are not in
    const modelDir = path.join(rootDir, "models");
    const args = [script, port, languages, modelDir];

    console.log(`Starting OCR server`, args);

    const server = child_process.spawn("python3", args);

    process.on("exit", () => {
        console.log("Stopping OCR server");
        server.kill();
    });

    server.stdout.setEncoding('utf8');
    server.stdout.on("data", message => console.log(`[OCR server stdout] '${message}'`));
    server.stderr.setEncoding('utf8');
    server.stderr.on("data", message => console.error(`[OCR server stderr] '${message}'`));
    server.on('close', code => console.log(`OCR server exited with code ${code}`));

    const client = {
        async readText(imageBytes) {
            console.log(`Making OCR request (image size: ${imageBytes.length} bytes)`);
            try {
                const response = await axios.post(`http://localhost:${port}`, imageBytes, {
                    headers: { "Content-Type": "application/octet-stream" }
                });
                console.log(`Got response from OCR server`, response.headers);
                return response.data;
            } catch (e) {
                console.error(e);
                throw new Error("OCR request failed");
            }
        }
    };

    return new Promise((resolve, reject) => {
        server.stdout.on("data", message => {
            if (message.includes("[READY]")) {
                console.log("OCR server is ready to accept requests");
                resolve(client);
            }
        });

        server.on("error", error => {
            console.error("OCR server could not be started", error);
            reject(error);
        })
    });
}

const test = async () => {
    process.on('SIGINT', () => process.exit());
    process.on('SIGTERM', () => process.exit());

    // const dirname = path.dirname(fileURLToPath(import.meta.url));
    // const imagePath = path.join(dirname, "..", "..", "..", "samples", "img_with_jp.png");
    // console.log("image path", imagePath);
    // const imageBytes = fs.readFileSync(imagePath);
    const imageUrl = "https://cdn.discordapp.com/attachments/962719080345923654/970729505046011984/unknown.png";
    const imageBytes = (await axios.get(imageUrl, { responseType: "arraybuffer" })).data;
    console.log("image size", imageBytes.length);

    const client = await initClient();
    const matches = await client.readText(imageBytes);
    console.log(matches);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    test();
}

export { getOcrCommands };
