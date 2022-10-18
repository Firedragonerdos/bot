const { SlashCommand } = require('@eartharoid/dbf');
const { ApplicationCommandOptionType } = require('discord.js');
const ExtendedEmbedBuilder = require('../../lib/embed');

module.exports = class TagSlashCommand extends SlashCommand {
	constructor(client, options) {
		const descriptionLocalizations = {};
		client.i18n.locales.forEach(l => (descriptionLocalizations[l] = client.i18n.getMessage(l, 'commands.slash.tag.description')));

		const nameLocalizations = {};
		client.i18n.locales.forEach(l => (nameLocalizations[l] = client.i18n.getMessage(l, 'commands.slash.tag.name')));

		let opts = [
			{
				autocomplete: true,
				name: 'tag',
				required: true,
				type: ApplicationCommandOptionType.Integer,
			},
			{
				name: 'for',
				required: false,
				type: ApplicationCommandOptionType.User,
			},
		];
		opts = opts.map(o => {
			const descriptionLocalizations = {};
			client.i18n.locales.forEach(l => (descriptionLocalizations[l] = client.i18n.getMessage(l, `commands.slash.tag.options.${o.name}.description`)));

			const nameLocalizations = {};
			client.i18n.locales.forEach(l => (nameLocalizations[l] = client.i18n.getMessage(l, `commands.slash.tag.options.${o.name}.name`)));

			return {
				...o,
				description: descriptionLocalizations['en-GB'],
				descriptionLocalizations,
				nameLocalizations: nameLocalizations,
			};
		});

		super(client, {
			...options,
			description: descriptionLocalizations['en-GB'],
			descriptionLocalizations,
			dmPermission: false,
			name: nameLocalizations['en-GB'],
			nameLocalizations,
			options: opts,
		});
	}

	/**
	 * @param {import("discord.js").ChatInputCommandInteraction} interaction
	 */
	async run(interaction) {
		/** @type {import("client")} */
		const client = this.client;

		const user = interaction.options.getUser('for', false);
		await interaction.deferReply({ ephemeral: !user });
		const tag = await client.prisma.tag.findUnique({
			include: { guild: true },
			where: { id: interaction.options.getInteger('tag', true) },
		});

		await interaction.editReply({
			allowedMentions: { users: user ? [user.id]: [] },
			content: user?.toString(),
			embeds: [
				new ExtendedEmbedBuilder()
					.setColor(tag.guild.primaryColour)
					.setDescription(tag.content),
			],
		});
	}
};