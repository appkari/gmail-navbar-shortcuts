// MeetCard.gs — Google Meet homepage card

function onMeetHomepage(e) {
  return buildMeetCard(e);
}

function buildMeetCard(e) {
  const card = CardService.newCardBuilder()
    .setHeader(buildHeader('Label & Link Manager', 'Google Meet'));

  const allLinks = getLinks();

  // Surface all links so they're accessible during a meeting
  card.addSection(buildLinksSection(allLinks, 'No links saved. Add links to surface them here during meetings.'));

  // Quick add link (useful during calls)
  const quickAddSection = CardService.newCardSection().setHeader('Quick Add');

  quickAddSection.addWidget(
    CardService.newTextInput()
      .setFieldName('meet_link_title')
      .setTitle('Title')
      .setHint('e.g. Meeting notes, Shared doc')
  );

  quickAddSection.addWidget(
    CardService.newTextInput()
      .setFieldName('meet_link_url')
      .setTitle('URL')
      .setHint('https://')
  );

  quickAddSection.addWidget(
    CardService.newTextButton()
      .setText('Save Link')
      .setBackgroundColor(BRAND_COLOR)
      .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
      .setOnClickAction(CardService.newAction().setFunctionName('handleSaveMeetLink'))
  );

  card.addSection(quickAddSection);

  // Label filter shortcuts
  const labels = getCustomLabels();
  if (labels.length > 0) {
    const filterSection = CardService.newCardSection()
      .setHeader('Filter by Label')
      .setCollapsible(true)
      .setNumUncollapsibleWidgets(0);

    labels.forEach(function(lbl) {
      const labelLinks = getLinksByLabel(lbl.name);
      if (labelLinks.length === 0) return;

      filterSection.addWidget(
        CardService.newTextParagraph()
          .setText('<b>' + lbl.name + '</b> (' + labelLinks.length + ')')
      );

      labelLinks.slice(0, 5).forEach(function(link) {
        filterSection.addWidget(
          CardService.newDecoratedText()
            .setText(link.title)
            .setBottomLabel(link.url)
            .setOpenLink(CardService.newOpenLink().setUrl(link.url))
        );
      });
    });

    card.addSection(filterSection);
  }

  return card.build();
}
