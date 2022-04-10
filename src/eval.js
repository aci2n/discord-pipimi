import { PipimiCommand, PipimiResponse } from "./framework/command.js";

/**
 * @returns {PipimiCommand[]}
 */
const getEvalCommands = () => {
    const delimiter = "```";

    return [PipimiCommand.standard("!eval", ["sudoers"], async (_, args) => {
        let expression = args.trim();

        if (expression.startsWith(delimiter) && expression.endsWith(delimiter)) {
            expression = expression.substring(delimiter.length, expression.length - delimiter.length);
        }

        if (!expression) {
            return PipimiResponse.send("Empty expression.");
        }

        let result;
        try {
            console.log("evaluating javascript:", expression);
            result = eval(expression);
        } catch (e) {
            return PipimiResponse.error("Could not evaluate expression", e);
        }

        return PipimiResponse.send(String(result));
    })];
};

export { getEvalCommands };
