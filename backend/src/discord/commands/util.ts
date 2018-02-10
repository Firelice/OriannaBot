import { CommandContext } from "../command";
import { Server, User } from "../../database";
import StaticData from "../../riot/static-data";
import config from "../../config";

/**
 * Utility method that takes a command context and either gets the current server or
 * sends an error to the user (if the command was used in a DM).
 */
export async function expectServer({ guild, error, server }: CommandContext): Promise<Server | undefined> {
    if (!guild) {
        await error({
            title: "🔍 What server?",
            description: "I'll need to know what server you are talking about. Try doing this again, but in a server instead of DMs."
        });
        return;
    }

    return server();
}

/**
 * Utility method that takes a command context and finds the user the message is
 * targeting. This looks for the first non-bot mention, or otherwise the sender
 * of the message.
 */
export async function expectUser({ msg, client, user }: CommandContext): Promise<User> {
    const mentionTarget = msg.mentions.find(x => !x.bot);
    return mentionTarget ? client.findOrCreateUser(mentionTarget.id) : user();
}

/**
 * Utility method that takes a command context and checks if the user invoking
 * the command has moderator permissions. If the user does, it returns true. If
 * the user does not, it will print a message and return false.
 */
export async function expectModerator({ msg, error, guild }: CommandContext): Promise<boolean> {
    // If this was sent in DMs, this is illegal and should really throw, but we will abort.
    if (!guild) return false;

    // Bot and server owner can obviously do anything.
    if (msg.author.id === config.discord.owner || msg.author.id === guild.ownerID) return true;

    // If the user can manage messages, they are considered a moderator.
    if (msg.member!.permission.has("manageMessages")) return true;

    await error({
        title: "✋ Stop Right There!",
        description: "You must be able to manage messages to use this feature. Sorry :("
    });
    return false;
}

/**
 * Attempts to find a champion in the specified command context. If no champion name is found,
 * the server default is used, if the message was sent in a server with a default champion set.
 * If none of those are matched, sends a message and returns undefined instead.
 */
export async function expectChampion({ content, guild, server, error }: CommandContext): Promise<riot.Champion | undefined> {
    const match = await StaticData.findChampion(content);
    if (match) return match;

    if (guild) {
        const serverDefault = (await server()).default_champion;
        if (serverDefault) return await StaticData.championById(serverDefault);
    }

    await error({
        title: "🔎 Which Champion?",
        description: "I tried to look for a champion name in your message, but I was unable to find one. Either you had a typo somewhere or you forgot to specify the name of a champion."
    });
    // Implicitly return undefined.
}