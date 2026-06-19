// CardUtils.gs — Shared card-building utilities

const BRAND_COLOR = '#1A73E8';
const DANGER_COLOR = '#D93025';
const SUCCESS_COLOR = '#1E8E3E';
const MUTED_COLOR = '#5F6368';

const LABEL_COLORS = [
  { name: 'Blue',   hex: '#4A90D9' },
  { name: 'Green',  hex: '#1E8E3E' },
  { name: 'Red',    hex: '#D93025' },
  { name: 'Yellow', hex: '#F9AB00' },
  { name: 'Purple', hex: '#9334E6' },
  { name: 'Teal',   hex: '#00897B' }
];

function buildHeader(title, subtitle, iconUrl) {
  const header = CardService.newCardHeader().setTitle(title);
  if (subtitle) header.setSubtitle(subtitle);
  if (iconUrl) {
    header.setImageUrl(iconUrl).setImageStyle(CardService.ImageStyle.CIRCLE);
  }
  return header;
}

function buildLinkRow(link) {
  const badge = link.label
    ? ' [' + link.label + ']'
    : '';

  const widget = CardService.newDecoratedText()
    .setTopLabel(link.label || 'No label')
    .setText(link.title)
    .setBottomLabel(link.url)
    .setWrapText(false)
    .setOpenLink(CardService.newOpenLink().setUrl(link.url));

  const deleteAction = CardService.newAction()
    .setFunctionName('handleDeleteLink')
    .setParameters({ linkId: link.id });

  widget.setButton(
    CardService.newImageButton()
      .setIconUrl('https://fonts.gstatic.com/s/i/googlematerialicons/delete/v15/gmsm_delete-24px.svg')
      .setAltText('Delete')
      .setOnClickAction(deleteAction)
  );

  return CardService.newDecoratedText()
    .setTopLabel(link.label || 'Unlabeled')
    .setText(link.title)
    .setBottomLabel(link.url)
    .setWrapText(false)
    .setOpenLink(CardService.newOpenLink().setUrl(link.url))
    .setButton(
      CardService.newImageButton()
        .setIconUrl('https://fonts.gstatic.com/s/i/googlematerialicons/delete/v15/gmsm_delete-24px.svg')
        .setAltText('Remove')
        .setOnClickAction(deleteAction)
    );
}

function buildAddLinkForm(prefillTitle, prefillUrl) {
  const card = CardService.newCardBuilder()
    .setHeader(buildHeader('Add Quick Link', 'Save a URL with an optional label'));

  const labels = getCustomLabels();
  const labelItems = [{ display: '-- No label --', value: '' }].concat(
    labels.map(function(l) { return { display: l.name, value: l.name }; })
  );

  const formSection = CardService.newCardSection();

  formSection.addWidget(
    CardService.newTextInput()
      .setFieldName('link_title')
      .setTitle('Title')
      .setHint('e.g. Figma Design, Project Brief')
      .setValue(prefillTitle || '')
  );

  formSection.addWidget(
    CardService.newTextInput()
      .setFieldName('link_url')
      .setTitle('URL')
      .setHint('https://')
      .setValue(prefillUrl || '')
  );

  const labelSelect = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.DROPDOWN)
    .setTitle('Label')
    .setFieldName('link_label');

  labelItems.forEach(function(item) {
    labelSelect.addItem(item.display, item.value, false);
  });

  formSection.addWidget(labelSelect);

  formSection.addWidget(
    CardService.newTextButton()
      .setText('Save Link')
      .setBackgroundColor(BRAND_COLOR)
      .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
      .setOnClickAction(CardService.newAction().setFunctionName('handleSaveLink'))
  );

  card.addSection(formSection);
  return card.build();
}

function buildLinksSection(links, emptyMsg) {
  const section = CardService.newCardSection()
    .setHeader('Quick Links')
    .setCollapsible(false);

  if (!links || links.length === 0) {
    section.addWidget(
      CardService.newTextParagraph().setText(
        '<font color="' + MUTED_COLOR + '">' + (emptyMsg || 'No links saved yet.') + '</font>'
      )
    );
    return section;
  }

  links.slice(0, 20).forEach(function(link) {
    section.addWidget(buildLinkRow(link));
  });

  if (links.length > 20) {
    section.addWidget(
      CardService.newTextParagraph().setText(
        '<font color="' + MUTED_COLOR + '">+ ' + (links.length - 20) + ' more. Manage via Settings.</font>'
      )
    );
  }

  return section;
}

function buildNotification(message) {
  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText(message))
    .build();
}

function buildNavigateResponse(card) {
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(card))
    .build();
}

function buildRefreshResponse() {
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().updateCard(
      CardService.newCardBuilder().build()
    ))
    .build();
}
