import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView,
  Platform, ActivityIndicator, Modal,
} from 'react-native';
import LogoIcon from '../components/LogoIcon';
import { sendMessage, getSessionHistory } from '../api/client';
import MessageBubble from '../components/MessageBubble';
import TypingIndicator from '../components/TypingIndicator';
import DrawerContent from '../components/DrawerContent';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

const GREETING = {
  role: 'assistant',
  content: "Hello! I'm CareFindr AI 👋\nYour AI health assistant. How are you feeling today? Please describe your symptoms and I'll help you find the right doctor.",
};

export default function ChatScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const scrollRef = useRef(null);

  const scrollToBottom = () => scrollRef.current?.scrollToEnd({ animated: true });

  const handleKeyPress = (e) => {
    if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
      e.preventDefault?.();
      handleSend();
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await sendMessage(sessionId, text);
      const data = res.data;
      if (!sessionId) setSessionId(data.session_id);
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again.",
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    setSessionId(null);
    setMessages([GREETING]);
    setDrawerOpen(false);
  };

  const handleSelectSession = async (id) => {
    setDrawerOpen(false);
    setSessionId(id);
    setMessages([]);
    try {
      const res = await getSessionHistory(id);
      const history = res.data.messages;
      setMessages(history.length ? history : [GREETING]);
    } catch {
      setMessages([GREETING]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Sidebar drawer */}
      <Modal visible={drawerOpen} transparent animationType="none">
        <View style={styles.drawerOverlay}>
          <View style={styles.drawerPanel}>
            <DrawerContent
              visible={drawerOpen}
              onSelectSession={handleSelectSession}
              onNewChat={handleNewChat}
            />
          </View>
          <TouchableOpacity style={styles.drawerBackdrop} onPress={() => setDrawerOpen(false)} />
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setDrawerOpen(true)} style={styles.menuBtn}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.logoIcon}>
            <LogoIcon size={20} onDark={true} />
          </View>
          <View>
            <Text style={styles.headerTitle}>
              Care<Text style={styles.headerTitleAccent}>Findr</Text>
            </Text>
            <Text style={styles.headerSubtitle}>Find care. Feel better.</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleNewChat} style={styles.newChatBtn}>
          <Text style={styles.newChatText}>New Chat</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={scrollToBottom}
        onLayout={scrollToBottom}
      >
        {messages.map((item, i) => <MessageBubble key={i} message={item} />)}
        {isTyping && <TypingIndicator />}
      </ScrollView>

      {/* Input Bar */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Type your symptoms..."
            placeholderTextColor={colors.textSecondary}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            onKeyPress={handleKeyPress}
            multiline
            blurOnSubmit={false}
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || isTyping}
          >
            {isTyping
              ? <ActivityIndicator size="small" color={colors.white} />
              : <Text style={styles.sendIcon}>→</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: colors.iceBlue,
    flexDirection: 'column',
  },
  // Drawer
  drawerOverlay: { flex: 1, flexDirection: 'row' },
  drawerPanel: { width: 300, backgroundColor: colors.white, zIndex: 10 },
  drawerBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  // Header
  header: {
    backgroundColor: colors.navy,
    paddingHorizontal: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuBtn: { padding: 4 },
  menuIcon: { color: colors.white, fontSize: 20 },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIcon: {
    width: 34, height: 34, backgroundColor: colors.teal,
    borderRadius: 10, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { color: colors.white, fontSize: 17, fontWeight: '500' },
  headerTitleAccent: { color: colors.teal },
  headerSubtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 1 },
  newChatBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  newChatText: { color: colors.white, fontSize: 11 },
  // Messages
  messages: { flex: 1 },
  messageList: { paddingVertical: 16, paddingBottom: 8 },
  // Input
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    backgroundColor: colors.white, borderTopWidth: 0.5,
    borderTopColor: colors.border, paddingHorizontal: 12, paddingVertical: 10, gap: 8,
  },
  input: {
    flex: 1, backgroundColor: colors.iceBlue, borderWidth: 0.5,
    borderColor: colors.border, borderRadius: 20, paddingHorizontal: 16,
    paddingVertical: 10, fontSize: 14, color: colors.textPrimary, maxHeight: 100,
  },
  sendBtn: {
    width: 40, height: 40, backgroundColor: colors.navy,
    borderRadius: 20, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: colors.textSecondary },
  sendIcon: { color: colors.white, fontSize: 18, fontWeight: '600' },
});
