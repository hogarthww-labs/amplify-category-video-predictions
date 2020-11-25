async function getNotificationChannel({evRecord, aws}) {
  let SNSTopicArn = params.SNSTopicArn
  const RoleArn = params.RoleArn

  if (SNSTopicArn) {
    return {
      SNSTopicArn,
      RoleArn      
    }
  } else {
    // TODO: extract into function
    let TopicName = asset.evRecord.TopicName || 'AI_Tags'
    SNSTopicArn = await getOrCreateTopicArnByName(TopicName, { evRecord, aws})
    return {
      SNSTopicArn,
      RoleArn
    }
  }
}

module.exports = {
  getNotificationChannel
}
