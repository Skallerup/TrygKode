import { TextStyle } from 'react-native';

export const typography = {
  hero: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.5,
  } as TextStyle,

  h1: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 34,
    letterSpacing: -0.3,
  } as TextStyle,

  h2: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 28,
  } as TextStyle,

  h3: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  } as TextStyle,

  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  } as TextStyle,

  bodyBold: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  } as TextStyle,

  caption: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  } as TextStyle,

  small: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  } as TextStyle,

  button: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
  } as TextStyle,
} as const;
