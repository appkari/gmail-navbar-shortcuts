// ChatCard.gs — Google Chat homepage card

function onChatHomepage(e) {
  return buildChatCard(e);
}

function buildChatCard(e) {
  const card = CardService.newCardBuilder()
    .setHeader(buildHeader('Label & Link Manager', 'Google Chat'));

  // Filter bar by label
  const labels   = getCustomLabels();
  const allLinks = getLinks();

  // Pinned / all links
  card.addSection(buildLinksSection(allLinks, 'No links saved. Use the + button to add one.'));

  // Labels overview
  if (labels.length > 0) {
    const labelsSection = CardService.newCardSection()
      .setHeader('Your Labels')
      .setCollapsible(true)
      .setNumUncollapsibleWidgets(0);

    labels.forEach(function(lbl) {
      const count = getLinksByLabel(lbl.name).length;
      labelsSection.addWidget(
        CardService.newDecoratedText()
          .setText(lbl.name)
          .setBottomLabel(count + ' link' + (count !== 1 ? 's' : ''))
          .setButton(
            CardService.newImageButton()
              .setIconUrl('https://fonts.gstatic.com/s/i/googlematerialicons/delete/v15/gmsm_delete-24px.svg')
              .setAltText('Delete label')
              .setOnClickAction(
                CardService.newAction()
                  .setFunctionName('handleDeleteCustomLabel')
                  .setParameters({ labelName: lbl.name })
              )
          )
      );
    });

    card.addSection(labelsSection);
  }

  // Actions row
  const actionsSection = CardService.newCardSection();
  actionsSection.addWidget(
    CardService.newButtonSet()
      .addButton(
        CardService.newTextButton()
          .setText('+ Link')
          .setBackgroundColor(BRAND_COLOR)
          .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
          .setOnClickAction(CardService.newAction().setFunctionName('openAddLinkDialog'))
      )
      .addButton(
        CardService.newTextButton()
          .setText('+ Label')
          .setOnClickAction(CardService.newAction().setFunctionName('openAddLabelDialog'))
      )
  );

  card.addSection(actionsSection);
  return card.build();
}
