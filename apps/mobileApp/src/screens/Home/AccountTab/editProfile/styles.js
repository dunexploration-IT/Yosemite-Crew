import { StyleSheet } from 'react-native';
import { scaledHeightValue, scaledValue } from '../../../../utils/design.utils';
import { colors } from '../../../../../assets/colors';
import { fonts } from '../../../../utils/fonts';

export const styles = StyleSheet.create({
  dashboardMainView: {
    flex: 1,
    backgroundColor: colors.themeColor,
  },

  profileButton: {
    alignItems: 'center',
    marginTop: scaledValue(24),
    width: scaledValue(100),
    height: scaledValue(100),
    alignSelf: 'center',
  },
  profileImage: {
    width: scaledValue(100),
    height: scaledValue(100),
  },
  formContainer: {
    paddingHorizontal: scaledValue(20),
    marginTop: scaledValue(12),
    gap: scaledValue(20),
  },
  input: {
    width: '100%',
    backgroundColor: 'transparent',
    fontSize: scaledValue(16),
    // lineHeight: scaledValue(16),
    // marginTop: scaledValue(20),
    paddingLeft: scaledValue(10),
  },
  phoneInput: {
    width: scaledValue(210),
    backgroundColor: 'transparent',
    fontSize: scaledValue(16),
    lineHeight: scaledValue(16),
    // marginTop: scaledValue(20),
    paddingLeft: scaledValue(10),
  },
  cityZipContainer: {
    flexDirection: 'row',
    // marginTop: scaledValue(20),
    justifyContent: 'space-between',
  },
  cityInput: {
    width: scaledValue(163.5),
    backgroundColor: 'transparent',
    fontSize: scaledValue(16),
    // lineHeight: scaledValue(16),
    paddingLeft: scaledValue(10),
  },
  zipInput: {
    width: scaledValue(163.5),
    backgroundColor: 'transparent',
    fontSize: scaledValue(16),
    // lineHeight: scaledValue(16),
    paddingLeft: scaledValue(10),
  },
  professionalButton: {
    borderWidth: scaledValue(0.5),
    height: scaledValue(48),
    // marginTop: scaledValue(20),
    borderRadius: scaledValue(24),
    paddingHorizontal: scaledValue(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  professionalText: {
    fontSize: scaledValue(16),
    lineHeight: scaledHeightValue(16),
    letterSpacing: scaledValue(16 * -0.03),
    color: '#312943',
  },
  pimsButton: {
    borderWidth: scaledValue(0.5),
    height: scaledValue(48),
    marginTop: scaledValue(20),
    borderRadius: scaledValue(24),
    paddingHorizontal: scaledValue(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pimsText: {
    fontSize: scaledValue(16),
    lineHeight: scaledHeightValue(16),
    letterSpacing: scaledValue(16 * -0.03),
    color: '#312943',
  },
  arrowIcon: {
    width: scaledValue(20),
    height: scaledValue(20),
  },
  scanIcon: {
    width: scaledValue(20),
    height: scaledValue(20),
    marginRight: scaledValue(10),
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: scaledValue(38),
    paddingHorizontal: scaledValue(10),
  },
  checkboxContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  checkboxIcon: {
    width: scaledValue(20),
    height: scaledValue(20),
  },
  text: {
    fontSize: scaledValue(16),
    lineHeight: scaledHeightValue(19.2),
    letterSpacing: scaledValue(16 * -0.02),
    color: '#37223C',
    flexShrink: 1,
    fontFamily: fonts?.SATOSHI_REGULAR,
    left: scaledValue(10),
  },
  link: {
    fontSize: scaledValue(16),
    lineHeight: scaledHeightValue(19.2),
    letterSpacing: scaledValue(16 * -0.02),
    color: '#D04122',
    flexShrink: 1,
    fontFamily: fonts?.SATOSHI_MEDIUM,
  },
  createAccountButton: {
    backgroundColor: '#FDBD74',
    width: '100%',
    height: scaledValue(52),
    borderRadius: scaledValue(28),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: scaledValue(27),
  },
  createAccountButtonText: {
    fontSize: scaledValue(18),
    lineHeight: scaledHeightValue(18),
    letterSpacing: scaledValue(18 * -0.01),
    fontFamily: fonts?.CLASH_GRO_MEDIUM,
    color: '#4E3F2F',
  },
});
