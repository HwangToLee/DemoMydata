import React from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import CodePush, {
  ReleaseHistoryInterface,
  UpdateCheckRequest,
} from '@bravemobile/react-native-code-push';
import axios from 'axios';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'http://874597c900bdf65a799c6cfe069d498b@192.168.0.125:8000/2',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration(),
  ],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

const styles = StyleSheet.create({
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },
});

const App = () => {
  const handleCheckUpdate = () => {
    CodePush.sync(
      {
        installMode: CodePush.InstallMode.IMMEDIATE, // 다운받자마자 바로 적용
        // updateDialog: true, // (옵션) 팝업으로 안내도 가능
      },
      status => {
        console.log('CodePush status:', status);
      },
      progress => {
        console.log(
          `Received ${progress.receivedBytes} of ${progress.totalBytes} bytes.`,
        );
      },
    );
  };

  return (
    <View style={styles.center}>
      <Text>Test For CodePush: ver1.0.19</Text>
      <Button title="업데이트 확인" onPress={handleCheckUpdate} />
      <Button title='Try!' onPress={ () => { Sentry.captureException(new Error('First error')) }}/>
    </View>
  );
};
const S3_ENDPOINT = 'http://192.168.0.125:9000'; // S3 API 포트
const BUCKET = 'codepush-demo-my-data';
const PLATFORM = 'ios'; // or "android"
const IDENTIFIER = 'staging';

async function releaseHistoryFetcher(
  updateRequest: UpdateCheckRequest,
): Promise<ReleaseHistoryInterface> {
  const { app_version } = updateRequest;
  console.log('releaseHistoryFetcher');

  // Fetch release history for current binary app version.
  // You can implement how to fetch the release history freely. (Refer to the example app if you need a guide)
  const url = `${S3_ENDPOINT}/${BUCKET}/histories/${PLATFORM}/${IDENTIFIER}/${app_version}.json`;
  console.log('CodePush fetch url:', url);

  const { data: releaseHistory } = await axios.get<ReleaseHistoryInterface>(
    url,
  );
  console.log('CodePush fetch data:', releaseHistory);
  return releaseHistory;
}

export default Sentry.wrap(
  CodePush({
    checkFrequency: CodePush.CheckFrequency.ON_APP_START, // or something else
    releaseHistoryFetcher: releaseHistoryFetcher,
  })(App),
);
