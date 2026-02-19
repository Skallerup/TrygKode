import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors, typography, borderRadius } from '../theme';

interface AvatarProps {
  name: string;
  imageUri?: string;
  size?: number;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function getAvatarColor(name: string): string {
  const avatarColors = [
    '#4A90D9', '#34C759', '#FF9500', '#AF52DE',
    '#FF3B30', '#5AC8FA', '#FF2D55', '#FFCC00',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export const Avatar: React.FC<AvatarProps> = ({ name, imageUri, size = 48 }) => {
  if (imageUri) {
    return (
      <Image
        source={{ uri: imageUri }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: getAvatarColor(name),
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.38 }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  image: {
    resizeMode: 'cover',
  },
});
