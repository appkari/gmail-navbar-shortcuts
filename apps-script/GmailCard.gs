// GmailCard.gs — Gmail contextual and homepage cards

function onGmailHomepage(e) {
  return buildGmailHomepageCard();
}

function onGmailMessage(e) {
  const messageId = e.gmail ? e.gmail.messageId : null;
  const threadId  = e.gmail ? e.gmail.threadId  : null;
  if (!messageId) return buildGmailHomepageCard();
  return buildGmailContextCard(threadId, messageId);
}

// ---- Gmail Homepage (no email selected) ----

function buildGmailHomepageCard() {
  const card = CardService.newCardBuilder()
    .setHeader(buildHeader('Label & Link Manager', 'Gmail'));

  // Quick Links section
  const links = getLinks();
  card.addSection(buildLinksSection(links, 'No quick links yet. Use the + button below.'));

  // Add link button
  card.addSection(
    CardService.newCardSection().addWidget(
      CardService.newTextButton()
        .setText('+ Add Quick Link')
        .setBackgroundColor(BRAND_COLOR)
        .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
        .setOnClickAction(CardService.newAction().setFunctionName('openAddLinkDialog'))
    )
  );

  return card.build();
}

// ---- Gmail Contextual Card (email open) ----

function buildGmailContextCard(threadId, messageId) {
  const card = CardService.newCardBuilder()
    .setHeader(buildHeader('Label & Link Manager', 'Apply labels to this thread'));

  // --- Gmail Labels section ---
  const gmailLabelsSection = CardService.newCardSection()
    .setHeader('Gmail Labels')
    .setCollapsible(false);

  const allLabels    = getGmailLabels();
  const threadLabels = getThreadLabels(threadId);

  if (allLabels.length === 0) {
    gmailLabelsSection.addWidget(
      CardService.newTextParagraph().setText('<font color="' + MUTED_COLOR + '">No Gmail labels found.</font>')
    );
  } else {
    // Show existing labels with remove buttons
    if (threadLabels.length > 0) {
      const appliedSection = CardService.newCardSection().setHeader('Applied');
      threadLabels.forEach(function(name) {
        appliedSection.addWidget(
          CardService.newDecoratedText()
            .setText(name)
            .setButton(
              CardService.newImageButton()
                .setIconUrl('https://fonts.gstatic.com/s/i/googlematerialicons/close/v15/gmsm_close-24px.svg')
                .setAltText('Remove')
                .setOnClickAction(
                  CardService.newAction()
                    .setFunctionName('handleRemoveGmailLabel')
                    .setParameters({ threadId: threadId, labelName: name })
                )
            )
        );
      });
      card.addSection(appliedSection);
    }

    // Dropdown to add a label
    const applySection = CardService.newCardSection().setHeader('Add Label');

    const labelSelect = CardService.newSelectionInput()
      .setType(CardService.SelectionInputType.DROPDOWN)
      .setTitle('Select label')
      .setFieldName('gmail_label_to_apply');

    allLabels.forEach(function(l) {
      labelSelect.addItem(l.name, l.name, false);
    });

    applySection.addWidget(labelSelect);

    applySection.addWidget(
      CardService.newTextButton()
        .setText('Apply Label')
        .setBackgroundColor(BRAND_COLOR)
        .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
        .setOnClickAction(
          CardService.newAction()
            .setFunctionName('handleApplyGmailLabel')
            .setParameters({ threadId: threadId })
        )
    );

    // New label input
    const newLabelSection = CardService.newCardSection().setHeader('Or create new label');
    newLabelSection.addWidget(
      CardService.newTextInput()
        .setFieldName('new_gmail_label')
        .setTitle('New label name')
        .setHint('e.g. Project-X, Follow-up')
    );
    newLabelSection.addWidget(
      CardService.newTextButton()
        .setText('Create & Apply')
        .setOnClickAction(
          CardService.newAction()
            .setFunctionName('handleCreateAndApplyGmailLabel')
            .setParameters({ threadId: threadId })
        )
    );

    card.addSection(applySection);
    card.addSection(newLabelSection);
  }

  // --- Quick Links section ---
  const links = getLinks();
  card.addSection(buildLinksSection(links, 'No quick links yet.'));

  card.addSection(
    CardService.newCardSection().addWidget(
      CardService.newTextButton()
        .setText('+ Add Quick Link')
        .setOnClickAction(CardService.newAction().setFunctionName('openAddLinkDialog'))
    )
  );

  return card.build();
}
