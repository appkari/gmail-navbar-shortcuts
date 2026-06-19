// Code.gs — Entry points and universal handlers

// ---- Universal / fallback homepage ----

function onHomepage(e) {
  // Shown in any host app that doesn't have a specific handler
  const host = e && e.hostApp ? e.hostApp : 'UNKNOWN';

  switch (host) {
    case 'GMAIL':    return onGmailHomepage(e);
    case 'CHAT':     return onChatHomepage(e);
    case 'MEET':     return onMeetHomepage(e);
    default:         return buildDefaultHomepageCard();
  }
}

function buildDefaultHomepageCard() {
  const card = CardService.newCardBuilder()
    .setHeader(buildHeader('Label & Link Manager', 'Open in Gmail, Chat, or Meet'));

  const links = getLinks();
  card.addSection(buildLinksSection(links));

  card.addSection(
    CardService.newCardSection().addWidget(
      CardService.newButtonSet()
        .addButton(
          CardService.newTextButton()
            .setText('+ Add Link')
            .setBackgroundColor(BRAND_COLOR)
            .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
            .setOnClickAction(CardService.newAction().setFunctionName('openAddLinkDialog'))
        )
        .addButton(
          CardService.newTextButton()
            .setText('+ Label')
            .setOnClickAction(CardService.newAction().setFunctionName('openAddLabelDialog'))
        )
    )
  );

  return card.build();
}

// ---- Universal Actions (available via "..." menu in any host) ----

function openAddLinkDialog(e) {
  return buildNavigateResponse(buildAddLinkForm());
}

function openManageLabels(e) {
  return buildNavigateResponse(buildManageLabelsCard());
}

function openAddLabelDialog(e) {
  return buildNavigateResponse(buildAddLabelForm());
}

// ---- Manage Labels Card ----

function buildManageLabelsCard() {
  const card = CardService.newCardBuilder()
    .setHeader(buildHeader('Manage Labels'));

  const labels = getCustomLabels();
  const section = CardService.newCardSection().setHeader('Your Labels');

  if (labels.length === 0) {
    section.addWidget(
      CardService.newTextParagraph()
        .setText('<font color="' + MUTED_COLOR + '">No labels yet. Create your first below.</font>')
    );
  } else {
    labels.forEach(function(lbl) {
      const count = getLinksByLabel(lbl.name).length;
      section.addWidget(
        CardService.newDecoratedText()
          .setText(lbl.name)
          .setBottomLabel(count + ' link' + (count !== 1 ? 's' : ''))
          .setButton(
            CardService.newImageButton()
              .setIconUrl('https://fonts.gstatic.com/s/i/googlematerialicons/delete/v15/gmsm_delete-24px.svg')
              .setAltText('Delete')
              .setOnClickAction(
                CardService.newAction()
                  .setFunctionName('handleDeleteCustomLabel')
                  .setParameters({ labelName: lbl.name })
              )
          )
      );
    });
  }

  card.addSection(section);

  const addSection = CardService.newCardSection().setHeader('New Label');

  addSection.addWidget(
    CardService.newTextInput()
      .setFieldName('new_label_name')
      .setTitle('Label name')
      .setHint('e.g. Work, Personal, Project-X')
  );

  const colorSelect = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.DROPDOWN)
    .setTitle('Color')
    .setFieldName('new_label_color');

  LABEL_COLORS.forEach(function(c) {
    colorSelect.addItem(c.name, c.hex, false);
  });
  addSection.addWidget(colorSelect);

  addSection.addWidget(
    CardService.newTextButton()
      .setText('Create Label')
      .setBackgroundColor(BRAND_COLOR)
      .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
      .setOnClickAction(CardService.newAction().setFunctionName('handleCreateLabel'))
  );

  card.addSection(addSection);
  return card.build();
}

function buildAddLabelForm() {
  return buildManageLabelsCard();
}
