import { GuildMember, User, VoiceState } from "discord.js";
import { PipimiCommand, PipimiContext } from "../framework/command.js";

/**
 * @returns {PipimiCommand[]}
 */
const getSergeantCommands = () => {
    const jailer = createJailer();

    return [
        PipimiCommand.prefixed(["carcel"], ["Sergeant"], getCarcelCommandHandler(jailer)),
        new PipimiCommand("sus", getSusCommandHandler(jailer))
    ]
};

/**
 * @param {Jailer} jailer 
 */
const getCarcelCommandHandler = jailer => {
    const customMessages = new Map([
        ["262957323994136578", "adios mosca"],
        ["94885721948561408", "<:poque:660633228536971265>"]
    ]);

    /**
     * @param {PipimiContext} context 
     * @returns {Promise<PipimiContext>}
     */
    return async context => {
        const { message, logger } = context;
        const { mentions, channel } = message;
        const movedUsers = await jailer(context, mentions.users.values());

        logger.debug(() => `Moved ${movedUsers.length} users to jail`);

        if (movedUsers.length > 0) {
            const customId = movedUsers.map(user => user.id).find(id => customMessages.has(id));
            if (customId) {
                logger.trace(() => `Sending custom jail message for user '${customId}': '${customMessages.get(customId)}'`);
            }
            await channel.send(customId ? customMessages.get(customId) : "👮");
        }

        return context;
    };
};

/**
 * @param {Jailer} jailer
 */
const getSusCommandHandler = jailer => {
    const pattern = /^(sus|amogus|amongus)$/i;
    const response = "https://seafile.aci2n.tk/f/2c5fdd4cc3274dfbb53b/?raw=1";

    /**
    * @param {PipimiContext} context 
    * @returns {Promise<PipimiContext>}
    */
    return async context => {
        const { message, logger } = context;
        const { content, author, channel } = message;

        if (pattern.test(content)) {
            logger.debug(() => "Detected amogus", content, author);

            await Promise.all([
                channel.send(response),
                jailer(context, [author])
            ]);
        }

        return context;
    };
};

/**
 * @callback Jailer
 * @param {PipimiContext} context
 * @param {User[]} users
 * @returns {Promise<User[]>}
 */

/**
 * @returns {Jailer}
 */
const createJailer = () => {
    const jailChannelId = "885247701019676732";

    /**
     * @type {Jailer}
     */
    return async (context, users) => {
        const { message, logger } = context;
        const { client, guild, channel } = message;

        /** @type {User[]} */
        const movedUsers = [];

        for (const user of users) {
            const member = await new GuildMember(client, { user }, guild).fetch();

            try {
                logger.trace(() => `About to move user '${member.id}' to jail`);
                if (await moveToChannel(member.voice, jailChannelId)) {
                    movedUsers.push(user);
                } else {
                    logger.debug(() => `User '${member.id}' was not moved (not in voice or already in jail?)`);
                }
            } catch (e) {
                logger.error(() => `Failed to move user '${member.id}': ${e}`);
                await channel.send(`Failed to move user.`);
                throw e;
            }
        }

        return movedUsers;
    };
};

/**
 * @param {VoiceState} voiceState
 * @param {string} channelId
 * @returns {Promise<boolean>}
 */
const moveToChannel = async (voiceState, channelId) => {
    if (!voiceState.channelID || voiceState.channelID === channelId) {
        return false;
    }
    await voiceState.setChannel(channelId);
    return true;
};

export { getSergeantCommands };