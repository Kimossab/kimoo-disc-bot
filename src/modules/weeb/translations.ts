const translation: BotModule.translation_object = {
  pt: {
    sauce: {
      command: "<trigger>sauce",
      description: "Looks up the source for the last image uploaded to this channel."
    },
    wiki: {
      command: "<trigger>wiki [wiki slug] [query]",
      description: "Gets the first article the search find for the given query in the wiki with the given slug.",
      parameters: "**[wiki slug]** slug of the wiki page (for example: swordartonline for <https://swordartonline.fandom.com>)\n**[query]** search query"
    },
    mal: {
      command: "<trigger>mal [(optional) tipo] [nome]",
      description: "Comando para obter link do MAL.",
      parameters: "**[(opcional) tipo]** tipo (anime/manga/person/character)\n**[nome]** nome a procurar"
    },
    no_image: "Nenhuma imagem foi encontrada neste canal.",
    no_sauce: "Sem molho para a massa. Procura tu próprio",
    sauce_ext_error: "External server error",
    sauce_int_error: "Internal server error",
    wiki_fail: "Não foi nada encontrado para `<query>` em `<wiki>.fandom.com`. Por favor verifique a pesquisa",
    no_data_found: "Não foi encontrado nenhum resultado para a pesquisa."
  },
  en: {
    sauce: {
      command: "<trigger>sauce",
      description: "Procura a origem da ultima imagem postada neste canal."
    },
    wiki: {
      command: "<trigger>wiki [wiki slug] [query]",
      description: "Gets the first article the search find for the given query in the wiki with the given slug.",
      parameters: "**[wiki slug]** slug of the wiki page (for example: swordartonline for <https://swordartonline.fandom.com>)\n**[query]** search query"
    },
    mal: {
      command: "<trigger>mal [(optional) type] [name]",
      description: "Command to get a MAL link.",
      parameters: "**[(optional) type]** type of info (anime/manga/person/character)\n**[name]** name or search query"
    },
    no_image: "No image found on this channel.",
    no_sauce: "No sauce found for the pasta. Google yourself.",
    sauce_ext_error: "External server error",
    sauce_int_error: "Internal server error",
    wiki_fail: "Nothing was found for `<query>` in `<wiki>.fandom.com`. Please verify the inputs",
    no_data_found: "No result found for the search query."

  }
}

export default translation;