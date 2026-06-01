import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import { 
  Search, 
  Send, 
  Paperclip, 
  MoreVertical, 
  Phone, 
  Video,
  UserPlus,
  Users,
  MessagesSquare,
  ArrowLeft,
  Home
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

/**
 * StudentMessages component
 *
 * @purpose
 * - Displays the messaging interface for a student.
 * - Allows students to view conversations, search contacts, and send messages.
 * - Filters contacts by role or unread messages.
 * - Formats message timestamps for display (Today, Yesterday, Day of Week, or Month/Day).
 *
 * @param None
 * @returns {JSX.Element} - Renders the StudentMessages component including:
 *   - Contact list with search and filtering functionality
 *   - Message history for the selected contact
 *   - Input box for sending new messages
 *   - Mobile chat view toggle
 * @throws None
 * @sideEffects
 * - Initializes local component state for:
 *   - `searchQuery`: search input for contacts
 *   - `showMobileChat`: toggles mobile chat view
 *   - `selectedContact`: the contact currently being viewed
 *   - `newMessage`: the content of the message being composed
 *   - `selectedTab`: filters contacts based on role or unread messages
 * - Uses `useAuth` to get the current user
 * - Handles message sending via `handleSendMessage` function
 *
 * @example
 * <StudentMessages />
 * 
 * // Filtering contacts by search query:
 * const filteredContacts = contacts.filter(contact =>
 *   contact.name.toLowerCase().includes(searchQuery.toLowerCase())
 * );
 *
 * // Formatting message timestamp:
 * const formattedTime = formatMessageTime(new Date());
 *
 * // Sending a new message
 * handleSendMessage();
 */
export default function StudentMessages() {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(1);
  const [messageText, setMessageText] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);

  /**
   * Mock conversations data for the StudentMessages component
   *
   * @purpose
   * - Provides example conversation data for testing or UI prototyping.
   * - Each object represents a conversation/contact in the messaging system.
   * - Used for rendering contact lists, showing unread counts, last messages, and online status.
   * @param None
   * @returns {Array<Object>} - Array of conversation objects with the following structure:
   *   - `id` {number} Unique identifier for the conversation
   *   - `name` {string} Name of the contact
   *   - `role` {"Teacher" | "Admin" | "Classmate"} Role of the contact
   *   - `avatar` {string} Path to the contact's avatar image
   *   - `lastMessage` {string} Text of the last message sent or received
   *   - `timestamp` {Date} Timestamp of the last message
   *   - `unread` {number} Count of unread messages
   *   - `online` {boolean} Online status of the contact
   * @throws None
   * @sideEffects None
   *
   * @example
   * const latestMessage = conversations[0].lastMessage; // "Great job on the guitar practice today!"
   * const isJohnOnline = conversations.find(c => c.name === "John Smith")?.online; // true
   */
  const conversations = [
    {
      id: 1,
      name: "John Smith",
      role: "Teacher",
      avatar: "/avatars/teacher1.png",
      lastMessage: "Great job on the guitar practice today!",
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      unread: 2,
      online: true
    },
    {
      id: 2,
      name: "Admin Office",
      role: "Admin",
      avatar: "/avatars/admin1.png",
      lastMessage: "Your next class has been rescheduled to Thursday.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      unread: 0,
      online: true
    },
    {
      id: 3,
      name: "Mia Parker",
      role: "Classmate",
      avatar: "/avatars/student2.png",
      lastMessage: "Did you get the notes from today's music theory class?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      unread: 0,
      online: false
    }
  ];

  /**
   * Mock message history
   *
   * @purpose
   * - Provides example chat messages for a given conversation.
   * - Used for testing or prototyping the messaging UI.
   * - Helps display messages, sender info, timestamps, and alignment (sent vs received).
   * @param None
   * @returns {Array<Object>} - Array of message objects with the following structure:
   *   - `id` {number} Unique identifier for the message
   *   - `conversationId` {number} ID of the conversation this message belongs to
   *   - `sender` {string} Name of the message sender
   *   - `content` {string} Text content of the message
   *   - `timestamp` {Date} Time when the message was sent
   *   - `isMe` {boolean} Whether the message was sent by the current user
   * @throws None
   * @sideEffects None
   * @example
   * const firstMessage = messageHistory[0].content; 
   * // "Hello! I wanted to talk about your progress with the new guitar piece."
   * const myMessages = messageHistory.filter(msg => msg.isMe); 
   * // Returns messages sent by "Me"
   */
  const messageHistory = [
    {
      id: 1,
      conversationId: 1,
      sender: "John Smith",
      content: "Hello! I wanted to talk about your progress with the new guitar piece.",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      isMe: false
    },
    {
      id: 2,
      conversationId: 1,
      sender: "Me",
      content: "Hi Mr. Smith! Yes, I've been practicing it every day.",
      timestamp: new Date(Date.now() - 1000 * 60 * 25), // 25 minutes ago
      isMe: true
    },
    {
      id: 3,
      conversationId: 1,
      sender: "John Smith",
      content: "That's great to hear! I noticed your fingerpicking technique has improved a lot since last week.",
      timestamp: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
      isMe: false
    },
    {
      id: 4,
      conversationId: 1,
      sender: "Me",
      content: "Thank you! I've been following your advice about thumb positioning.",
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      isMe: true
    },
    {
      id: 5,
      conversationId: 1,
      sender: "John Smith",
      content: "It's really paying off. Keep practicing that section in measures 15-20.",
      timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
      isMe: false
    },
    {
      id: 6,
      conversationId: 1,
      sender: "John Smith",
      content: "Great job on the guitar practice today! I think you'll be ready for the recital next month.",
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      isMe: false
    }
  ];

  /**
  * Defines breadcrumbs for the student messages page.
  *
  * @purpose To provide a navigational trail in the UI for user orientation.
  * @param None
  * @returns {Array<Object>} Array of breadcrumb objects with `title`, `href`, and optional `icon`.
  * @throws None
  * @sideEffects None
  * @example
  * <Breadcrumbs items={breadcrumbs} />
  */
  const breadcrumbs = [
    {
      title: "Home",
      href: "/student/dashboard",
      icon: <Home className="h-4 w-4" />
    },
    {
      title: "Messages"
    }
  ];

  /**
   * Filtered Conversations
   *
   * @purpose Filters and sorts all conversations based on the active tab and search query.
   *
   * @param None directly (uses `conversations`, `searchQuery`, `activeTab` from closure)
   * @returns Array of filtered and sorted conversation objects
   * @throws None
   * @sideEffects None
   *
   * @example
   * const result = filteredConversations;
   */
  const filteredConversations = conversations
    .filter(conversation => {
      // Filter by search query
      if (searchQuery && !conversation.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filter by tab
      if (activeTab === "teachers" && conversation.role !== "Teacher") {
        return false;
      }
      if (activeTab === "admin" && conversation.role !== "Admin") {
        return false;
      }
      if (activeTab === "classmates" && conversation.role !== "Classmate") {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  /**
   * Get Conversation Messages
   *
   * @purpose Retrieves all messages belonging to a specific conversation.
   * @param conversationId - The ID of the conversation
   * @returns Array of messages for the given conversation
   * @throws None
   *
   * @example
   * const messages = getConversationMessages(123);
   */
  const getConversationMessages = (conversationId: number) => {
    return messageHistory.filter(message => message.conversationId === conversationId);
  };

  /**
  * Handle Send Message
   *
   * @purpose Sends a message in the currently selected conversation and clears the input field.
   * @param None directly (uses `messageText` and `selectedConversation` from closure)
   * @returns void
   * @throws None
   * @sideEffects Clears `messageText` state
   *
   * @example
   * handleSendMessage();
   */
  const handleSendMessage = () => {
    if (messageText.trim() && selectedConversation) {
      // In a real app, you'd call an API to send the message
      // For now, just clear the input
      setMessageText("");
    }
  };

  /**
   * Get Role Color
   *
   * @purpose Returns the Tailwind CSS classes associated with a role for UI styling.
   * @param role - Role of the user (Teacher, Parent, Student, etc.)
   * @returns Tailwind CSS classes for background and text color
   * @throws None
   *
   * @example
   * const colorClass = getRoleColor("Teacher"); // "bg-blue-100 text-blue-800"
   */
  const getRoleColor = (role: string) => {
    switch (role) {
      case "Teacher":
        return "bg-blue-100 text-blue-800";
      case "Admin":
        return "bg-purple-100 text-purple-800";
      case "Classmate":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    // Appshell wraps the page content with header, and sidebar
    <AppShell>
      {/* PageHeader component with title, description, and breadcrumbs */}
      <PageHeader 
        title="Messages" 
        description="Communicate with teachers, classmates, and school administrators"
        breadcrumbs={breadcrumbs}
      />

      {/* Main content area */}
      <div className="mt-6">
        <Card className="border rounded-lg overflow-hidden">
          {/* Card content wrapper — removes default padding */}
          <CardContent className="p-0">
            <div className="h-[calc(100vh-240px)] flex">
              {/* Contacts sidebar - hidden on mobile when chat is open */}
              <div className={`w-full md:w-1/3 border-r ${showMobileChat ? 'hidden md:block' : 'block'}`}>
                <div className="p-4 border-b">
                  <div className="relative mb-3">
                    {/* Search icon placed inside the input box */}
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    {/* Search input — controlled by `searchQuery` state, updates on typing */}
                    <Input 
                      placeholder="Search conversations..." 
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  {/* Tabs for filtering conversations by user type */}
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-4 w-full">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="teachers">Teachers</TabsTrigger>
                      <TabsTrigger value="admin">Admin</TabsTrigger>
                      <TabsTrigger value="classmates">Classmates</TabsTrigger>
                    </TabsList>
                    {/* Tab panels — empty for now, only used for filtering */}
                    <TabsContent value="all"></TabsContent>
                    <TabsContent value="teachers"></TabsContent>
                    <TabsContent value="admin"></TabsContent>
                    <TabsContent value="classmates"></TabsContent>
                  </Tabs>
                </div>
                <div className="overflow-y-auto h-[calc(100%-72px)]">
                  {/* Scrollable conversation list area */}
                  {/* Takes remaining height after header section */}
                  {filteredConversations.length > 0 ? (
                    // If there are matching conversations, map through them
                    filteredConversations.map(conversation => (
                      <div 
                        key={conversation.id}
                        className={`p-3 border-b hover:bg-gray-50 cursor-pointer flex items-start ${selectedConversation === conversation.id ? 'bg-gray-50' : ''}`}
                        onClick={() => {
                          setSelectedConversation(conversation.id);
                          setShowMobileChat(true);
                        }}
                      >
                        <div className="relative mr-3">
                          <Avatar>
                            {/* Avatar fallback */}
                            <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
                            {/* Avatar image of the contact */}
                            <AvatarImage src={conversation.avatar} />
                          </Avatar>
                          {/* Online status indicator */}
                          {conversation.online && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            {/* Contact name */}
                            <h4 className="font-semibold text-sm truncate">{conversation.name}</h4>
                            {/* Time of last message */}
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(conversation.timestamp, { addSuffix: true })}
                            </span>
                          </div>
                          <Badge variant="outline" className={`text-xs my-1 ${getRoleColor(conversation.role)}`}>
                            {conversation.role}
                          </Badge>
                          <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                        </div>
                        {/* Unread message badge — shows count */}
                        {conversation.unread > 0 && (
                          <div className="ml-2 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {conversation.unread}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    // If no conversations match search/filter
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                      {/* Icon */}
                      <MessagesSquare className="h-12 w-12 text-gray-300 mb-3" />
                      {/* Heading */}
                      <h3 className="text-lg font-medium">No conversations found</h3>
                      {/* Subheading */}
                      <p className="text-sm text-gray-500 mt-1">
                        {/* Dynamic message depending on search state */}
                        {searchQuery ? "Try a different search term" : "Start a new conversation"}
                      </p>
                      {/* Button to start a new conversation */}
                      <Button className="mt-4" size="sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        New Message
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Chat area - shown on mobile when a chat is selected */}
              <div className={`w-full md:w-2/3 flex flex-col ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
                {selectedConversation ? (
                  <>
                    {/* Chat header */}
                    <div className="p-3 border-b flex items-center justify-between">
                      <div className="flex items-center">
                        {/* Back arrow button (only visible on mobile) — hides chat and shows sidebar */}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="md:hidden mr-2"
                          onClick={() => setShowMobileChat(false)}
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </Button>
                        {/* Avatar of the selected contact */}
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarFallback>
                            {conversations.find(c => c.id === selectedConversation)?.name.charAt(0)}
                          </AvatarFallback>
                          <AvatarImage 
                            src={conversations.find(c => c.id === selectedConversation)?.avatar} 
                          />
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-sm">
                            {/* Name of the selected contact */}
                            {conversations.find(c => c.id === selectedConversation)?.name}
                          </h3>
                          {/* Role and online status */}
                          <div className="flex items-center">
                            {/* Role badge */}
                            <Badge variant="outline" className={`text-xs ${getRoleColor(conversations.find(c => c.id === selectedConversation)?.role || "")}`}>
                              {conversations.find(c => c.id === selectedConversation)?.role}
                            </Badge>
                            <span className={`ml-2 text-xs ${conversations.find(c => c.id === selectedConversation)?.online ? 'text-green-500' : 'text-gray-500'}`}>
                              {conversations.find(c => c.id === selectedConversation)?.online ? 'Online' : 'Offline'}
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Action buttons (phone, video, more) */}
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="icon">
                          <Phone className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Video className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Chat messages area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {getConversationMessages(selectedConversation).map(message => (
                        <div 
                          key={message.id} 
                          className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
                        > 
                          {/* Each message container — aligns right if sent by me, left if from other person */}
                          <div className={`max-w-[70%] ${message.isMe ? 'bg-primary text-white' : 'bg-gray-100'} rounded-lg px-4 py-2`}>
                            {/* Message content */}
                            <div className="text-sm">{message.content}</div>
                            {/* Timestamp */}
                            <div className={`text-xs mt-1 ${message.isMe ? 'text-primary-foreground/70' : 'text-gray-500'}`}>
                              {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Message input area (bottom bar) */}
                    <div className="p-3 border-t">
                      <div className="flex items-center space-x-2">
                        {/* Header action buttons — call, video, more options */}
                        {/* Input row — attach button + text input + send button */}
                        <Button variant="ghost" size="icon">
                          <Paperclip className="h-5 w-5" />
                        </Button>
                        {/* Input field for message */}
                        <Input 
                          placeholder="Type your message..." 
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          className="flex-1"
                        />
                        {/* Send button */}
                        <Button size="icon" onClick={handleSendMessage} disabled={!messageText.trim()}>
                          <Send className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  // If no conversation selected — show empty state
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <Users className="h-16 w-16 text-gray-300 mb-3" />
                    <h3 className="text-xl font-medium">Select a conversation</h3>
                    <p className="text-sm text-gray-500 mt-1 max-w-md">
                      Choose a conversation from the left or start a new one to begin messaging
                    </p>
                    {/* Button to begin a new conversation */}
                    <Button className="mt-4">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Start New Conversation
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}