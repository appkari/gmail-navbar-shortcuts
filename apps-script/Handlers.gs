// Handlers.gs — Action handlers for all button/form interactions

// ---- Quick Link handlers ----

function handleSaveLink(e) {
  const form = e.commonEventObject.formInputs || {};
  const title = (form.link_title && form.link_title.stringInputs.value[0]) || '';
  const url   = (form.link_url   && form.link_url.stringInputs.value[0])   || '';
  const label = (form.link_label && form.link_label.stringInputs.value[0]) || '';

  if (!title.trim() || !url.trim()) {
    return buildNotification('Title and URL are required.');
  }

  if (!isValidUrl(url.trim())) {
    return buildNotification('URL must start with http:// or https://');
  }

  try {
    addLink(title, url, label);
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText('Link saved!'))
      .setNavigation(CardService.newNavigation().popCard())
      .build();
  } catch (err) {
    return buildNotification('Error: ' + err.message);
  }
}

function handleSaveMeetLink(e) {
  const form  = e.commonEventObject.formInputs || {};
  const title = (form.meet_link_title && form.meet_link_title.stringInputs.value[0]) || '';
  const url   = (form.meet_link_url   && form.meet_link_url.stringInputs.value[0])   || '';

  if (!title.trim() || !url.trim()) {
    return buildNotification('Title and URL are required.');
  }

  if (!isValidUrl(url.trim())) {
    return buildNotification('URL must start with http:// or https://');
  }

  try {
    addLink(title, url, '');
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText('Link saved!'))
      .setNavigation(CardService.newNavigation().updateCard(buildMeetCard(e)))
      .build();
  } catch (err) {
    return buildNotification('Error: ' + err.message);
  }
}

function handleDeleteLink(e) {
  const id = e.commonEventObject.parameters.linkId;
  removeLink(id);
  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText('Link removed.'))
    .setNavigation(CardService.newNavigation().updateCard(buildDefaultHomepageCard()))
    .build();
}

// ---- Custom Label handlers ----

function handleCreateLabel(e) {
  const form  = e.commonEventObject.formInputs || {};
  const name  = (form.new_label_name  && form.new_label_name.stringInputs.value[0])  || '';
  const color = (form.new_label_color && form.new_label_color.stringInputs.value[0]) || '#4A90D9';

  if (!name.trim()) {
    return buildNotification('Label name is required.');
  }

  const result = addCustomLabel(name, color);
  if (!result) {
    return buildNotification('Label "' + name + '" already exists.');
  }

  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText('Label "' + name + '" created!'))
    .setNavigation(CardService.newNavigation().updateCard(buildManageLabelsCard()))
    .build();
}

function handleDeleteCustomLabel(e) {
  const name = e.commonEventObject.parameters.labelName;
  removeCustomLabel(name);
  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText('Label "' + name + '" deleted.'))
    .setNavigation(CardService.newNavigation().updateCard(buildManageLabelsCard()))
    .build();
}

// ---- Gmail Label handlers ----

function handleApplyGmailLabel(e) {
  const params    = e.commonEventObject.parameters || {};
  const threadId  = params.threadId;
  const form      = e.commonEventObject.formInputs || {};
  const labelName = (form.gmail_label_to_apply && form.gmail_label_to_apply.stringInputs.value[0]) || '';

  if (!labelName) {
    return buildNotification('Please select a label.');
  }

  try {
    applyGmailLabel(threadId, labelName);
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText('Label "' + labelName + '" applied.'))
      .setNavigation(CardService.newNavigation().updateCard(buildGmailContextCard(threadId, null)))
      .build();
  } catch (err) {
    return buildNotification('Error: ' + err.message);
  }
}

function handleRemoveGmailLabel(e) {
  const params    = e.commonEventObject.parameters || {};
  const threadId  = params.threadId;
  const labelName = params.labelName;

  try {
    removeGmailLabel(threadId, labelName);
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText('Label "' + labelName + '" removed.'))
      .setNavigation(CardService.newNavigation().updateCard(buildGmailContextCard(threadId, null)))
      .build();
  } catch (err) {
    return buildNotification('Error: ' + err.message);
  }
}

function handleCreateAndApplyGmailLabel(e) {
  const params    = e.commonEventObject.parameters || {};
  const threadId  = params.threadId;
  const form      = e.commonEventObject.formInputs || {};
  const labelName = (form.new_gmail_label && form.new_gmail_label.stringInputs.value[0]) || '';

  if (!labelName.trim()) {
    return buildNotification('Enter a label name.');
  }

  try {
    createGmailLabel(labelName);
    applyGmailLabel(threadId, labelName);
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText('Label "' + labelName + '" created and applied.'))
      .setNavigation(CardService.newNavigation().updateCard(buildGmailContextCard(threadId, null)))
      .build();
  } catch (err) {
    return buildNotification('Error: ' + err.message);
  }
}
