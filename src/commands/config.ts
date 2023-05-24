import {
    APIRole,
    ChatInputCommandInteraction,
    PermissionsBitField,
    Role,
    roleMention,
} from 'discord.js';
import { IConfig, fetchConfig } from '../database/Config';
import { Command, newCommand, newSubcommand } from '../types/Command';

const command = newCommand()
    .setName('config')
    .setDescription('Manages the config.');

const configMinimumGames = newSubcommand()
    .setName('minimum-games')
    .setDescription('Games required to be seen on the leaderboard.')
    .addIntegerOption((option) =>
        option.setName('amount').setDescription('Number of games.')
    );

const configPointsGained = newSubcommand()
    .setName('points-gained')
    .setDescription('Points gained after winning a match.')
    .addIntegerOption((option) =>
        option.setName('amount').setDescription('Number of points gained.')
    );

const configPointsLost = newSubcommand()
    .setName('points-lost')
    .setDescription('Points lost after losing a match.')
    .addIntegerOption((option) =>
        option.setName('amount').setDescription('Number of points lost.')
    );

const configBasePoints = newSubcommand()
    .setName('base-points')
    .setDescription('Points added to values when displayed.')
    .addIntegerOption((option) =>
        option.setName('amount').setDescription('Number of points added.')
    );

const configDeckLimit = newSubcommand()
    .setName('deck-limit')
    .setDescription('Maximum decks a player can have.')
    .addIntegerOption((option) =>
        option.setName('amount').setDescription('Number of decks.')
    );

const configDisputeRole = newSubcommand()
    .setName('dispute-role')
    .setDescription('Role added to dispute threads.')
    .addRoleOption((option) =>
        option.setName('role').setDescription('Dispute role.')
    )
    .addBooleanOption((option) =>
        option.setName('unset').setDescription('Removes the dispute role.')
    );

export = <Command>{
    data: command
        .addSubcommand(configMinimumGames)
        .addSubcommand(configPointsGained)
        .addSubcommand(configPointsLost)
        .addSubcommand(configBasePoints)
        .addSubcommand(configDeckLimit)
        .addSubcommand(configDisputeRole)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild),

    async execute(interaction: ChatInputCommandInteraction) {
        switch (interaction.options.getSubcommand()) {
            case 'minimum-games':
                await handleMinimumGames(
                    interaction,
                    interaction.options.getInteger('amount')
                );
                break;

            case 'points-gained':
                await handlePointsGained(
                    interaction,
                    interaction.options.getInteger('amount')
                );
                break;

            case 'points-lost':
                await handlePointsLost(
                    interaction,
                    interaction.options.getInteger('amount')
                );
                break;

            case 'base-points':
                await handleBasePoints(
                    interaction,
                    interaction.options.getInteger('amount')
                );
                break;

            case 'deck-limit':
                await handleDeckLimit(
                    interaction,
                    interaction.options.getInteger('amount')
                );
                break;

            case 'dispute-role':
                await handleDisputeRole(
                    interaction,
                    interaction.options.getRole('role'),
                    interaction.options.getBoolean('unset')
                );
                break;
        }
    },
};

async function handleMinimumGames(
    interaction: ChatInputCommandInteraction,
    amount: number | null
) {
    const config = await fetchConfig(interaction.guildId!, {
        $set: {
            minimumGamesPerPlayer: amount ?? undefined,
        },
    });

    await interaction.reply({
        content: `The minimum games per player is ${
            amount === null ? 'currently' : 'now'
        } ${config.minimumGamesPerPlayer}.`,
        ephemeral: true,
    });
}

async function handlePointsGained(
    interaction: ChatInputCommandInteraction,
    amount: number | null
) {
    const config = await fetchConfig(interaction.guildId!, {
        $set: {
            pointsGained: amount ?? undefined,
        },
    });

    await interaction.reply({
        content: `The points gained per match win is ${
            amount === null ? 'currently' : 'now'
        } ${config.pointsGained}.`,
        ephemeral: true,
    });
}

async function handlePointsLost(
    interaction: ChatInputCommandInteraction,
    amount: number | null
) {
    const config = await fetchConfig(interaction.guildId!, {
        $set: {
            pointsLost: amount ?? undefined,
        },
    });

    await interaction.reply({
        content: `The points lost per match loss is ${
            amount === null ? 'currently' : 'now'
        } ${config.pointsLost}.`,
        ephemeral: true,
    });
}

async function handleBasePoints(
    interaction: ChatInputCommandInteraction,
    amount: number | null
) {
    const config = await fetchConfig(interaction.guildId!, {
        $set: {
            basePoints: amount ?? undefined,
        },
    });

    await interaction.reply({
        content: `The points added to values when displayed is ${
            amount === null ? 'currently' : 'now'
        } ${config.basePoints}.`,
        ephemeral: true,
    });
}

async function handleDeckLimit(
    interaction: ChatInputCommandInteraction,
    amount: number | null
) {
    const config = await fetchConfig(interaction.guildId!, {
        $set: {
            deckLimit: amount ?? undefined,
        },
    });

    await interaction.reply({
        content: `The maximum decks a player can have is ${
            amount === null ? 'currently' : 'now'
        } ${config.basePoints}.`,
        ephemeral: true,
    });
}

async function handleDisputeRole(
    interaction: ChatInputCommandInteraction,
    role: Role | APIRole | null,
    unset: boolean | null
) {
    let config: IConfig;

    if (unset) {
        config = await fetchConfig(interaction.guildId!, {
            $unset: {
                disputeRoleId: '',
            },
        });
    } else {
        config = await fetchConfig(interaction.guildId!, {
            $set: {
                disputeRoleId: role?.id ?? undefined,
            },
        });
    }

    await interaction.reply({
        content: `The dispute role is ${
            role === null && !unset ? 'currently' : 'now'
        } ${
            config.disputeRoleId ? roleMention(config.disputeRoleId) : 'unset'
        }.`,
        ephemeral: true,
    });
}
