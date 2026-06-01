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
 * ParentMessages component
 * 
 * @purpose The parent messages component displays a list of conversations and allows the parent to send messages to teachers and school administrators.
 * 
 * @param {Object} props - The component props.
 * @param {Object} props.user - The authenticated user object.
 * @returns {JSX.Element} The parent messages component.
 * @throws None
 * @sideEffects None
 * 
 * @example
 * <ParentMessages />
 */
export default function ParentMessages() {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(1);
  const [messageText, setMessageText] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);

  /**
   * Mock conversations data for the AdminMessages component
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
      lastMessage: "Riya has been doing great in her guitar lessons.",
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      unread: 2,
      online: true
    },
    {
      id: 2,
      name: "Admin Office",
      role: "Admin",
      avatar: "/avatars/admin1.png",
      lastMessage: "We've received your payment for this month's fees.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      unread: 0,
      online: true
    },
    {
      id: 3,
      name: "Maria Rodriguez",
      role: "Teacher",
      avatar: "/avatars/teacher2.png",
      lastMessage: "Can we reschedule Riya's next piano class?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      unread: 0,
      online: false
    }
  ];

  // Mock messages data
  const messageHistory = [
    {
      id: 1,
      conversationId: 1,
      sender: "John Smith",
      content: "Hello! I wanted to update you about Riya's progress in her guitar lessons.",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      isMe: false
    },
    {
      id: 2,
      conversationId: 1,
      sender: "Me",
      content: "Hi John, that would be great. How is she doing?",
      timestamp: new Date(Date.now() - 1000 * 60 * 25), // 25 minutes ago
      isMe: true
    },
    {
      id: 3,
      conversationId: 1,
      sender: "John Smith",
      content: "Riya has been doing exceptionally well. Her finger techniques have improved a lot, and she's starting to understand chord progressions.",
      timestamp: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
      isMe: false
    },
    {
      id: 4,
      conversationId: 1,
      sender: "Me",
      content: "That's wonderful to hear! She's been practicing at home as well.",
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      isMe: true
    },
    {
      id: 5,
      conversationId: 1,
      sender: "John Smith",
      content: "I can definitely see that. Her dedication is showing in her progress.",
      timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
      isMe: false
    },
    {
      id: 6,
      conversationId: 1,
      sender: "John Smith",
      content: "Riya has been doing great in her guitar lessons. I think she's ready for the upcoming recital next month.",
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      isMe: false
    }
  ];

  
  /**
  * Defines breadcrumbs for the messages page.
  *
  * @purpose To provide a navigational trail in the UI for user orientation.
  * 
  * @param None
  * @returns {Array<Object>} Array of breadcrumb objects with `title`, `href`, and optional `icon`.
  * @throws None
  * @sideEffects None
  * 
  * @example
  * <Breadcrumbs items={breadcrumbs} />
  */
  const breadcrumbs = [
    {
      title: "Home",
      href: "/parent/dashboard",
      icon: <Home className="h-4 w-4" />
    },
    {
      title: "Messages"
    }
  ];

  /**
   * Filters and sorts conversations based on the active tab and search query.
   *
   * @purpose Provides a list of conversations matching user-selected filters (tab and search input) for display in the chat sidebar.
   * 
   * @param None
   * @returns {Array} Filtered and sorted array of conversation objects.
   * @throws None
   * @sideEffects None directly; derived from state variables `conversations`, `activeTab`, and `searchQuery`.
   * 
   * @example
   * const filteredConversations = conversations
   *   .filter(conversation => {
   *     if (searchQuery && !conversation.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
   *     if (activeTab === "teachers" && conversation.role !== "Teacher") return false;
   *     if (activeTab === "admin" && conversation.role !== "Admin") return false;
   *     return true;
   *   })
   *   .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
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
      
      return true;
    })
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  /**
   * Retrieves messages for a specific conversation.
   *
   * @purpose Provides the list of messages belonging to a given conversation ID.
   *
   * @param {number} conversationId - The ID of the conversation to fetch messages for.
   * @returns {Array} Array of message objects belonging to the conversation.
   * @throws None
   * @sideEffects None; purely a filter operation on `messageHistory`.
   * 
   * @example const messages = getConversationMessages(1);
   */
  const getConversationMessages = (conversationId: number) => {
    return messageHistory.filter(message => message.conversationId === conversationId);
  };


  /**
   * Handles sending a message from the user.
   *
   * @purpose Sends the current message input to the backend (or clears the input in the mock implementation).
   *
   * @sideEffects Clears the `messageText` state after sending.
   * - Would trigger an API call in a real application.
   * @throws {Error} If message sending fails in a real API implementation.
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
   * Returns a CSS class string representing the background and text color for a given user role.
   *
   * @purpose Provides consistent visual styling for conversation role badges.
   * 
   * @param {string} role - The role of the user ("Teacher", "Admin", or other).
   * @returns {string} Tailwind CSS class string for background and text color.
   * @throws None
   * @sideEffects None; pure function.
   * 
   * @example const colorClass = getRoleColor("Teacher"); // "bg-blue-100 text-blue-800"
   */
  const getRoleColor = (role: string) => {
    switch (role) {
      case "Teacher":
        return "bg-blue-100 text-blue-800";
      case "Admin":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    // Appshell component is used to provide a consistent layout with a header, sidebar, and footer
    <AppShell>
      {/* PageHeader component is used to display the page title, description, and breadcrumbs */}
      <PageHeader 
        title="Messages" 
        description="Communicate with teachers and school administrators"
        breadcrumbs={breadcrumbs}
      />

      <div className="mt-6">
        <Card className="border rounded-lg overflow-hidden">
          <CardContent className="p-0">
            {/* Main layout: sidebar + chat area. Height fills viewport minus header/footer. */}
            <div className="h-[calc(100vh-240px)] flex">
              {/* Contacts sidebar - hidden on mobile when chat is open */}
              <div className={`w-full md:w-1/3 border-r ${showMobileChat ? 'hidden md:block' : 'block'}`}>
                <div className="p-4 border-b">
                  {/* Search bar with icon */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Search conversations..." 
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  {/* Tabs for filtering conversations by role */}
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-3 w-full">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="teachers">Teachers</TabsTrigger>
                      <TabsTrigger value="admin">Admin</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all"></TabsContent>
                    <TabsContent value="teachers"></TabsContent>
                    <TabsContent value="admin"></TabsContent>
                  </Tabs>
                </div>
                {/* Scrollable conversation list */}
                <div className="overflow-y-auto h-[calc(100%-72px)]">
                  {filteredConversations.length > 0 ? (
                    filteredConversations.map(conversation => (
                      <div 
                        key={conversation.id}
                        className={`p-3 border-b hover:bg-gray-50 cursor-pointer flex items-start ${selectedConversation === conversation.id ? 'bg-gray-50' : ''}`}
                        onClick={() => {
                          setSelectedConversation(conversation.id); // set active conversation
                          setShowMobileChat(true); // show mobile chat
                        }}
                      >
                        {/* Avatar + online indicator */}
                        <div className="relative mr-3">
                          <Avatar>
                            <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
                            <AvatarImage src={conversation.avatar} />
                          </Avatar>
                          {conversation.online && (
                            // small green dot for online state
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                          )}
                        </div>

                        {/* Main conversation info (truncated to avoid overflow) */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-sm truncate">{conversation.name}</h4>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(conversation.timestamp, { addSuffix: true })}
                            </span>
                          </div>

                          {/* Role badge */}
                          <Badge variant="outline" className={`text-xs my-1 ${getRoleColor(conversation.role)}`}>
                            {conversation.role}
                          </Badge>

                          {/* Last message preview */}
                          <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                        </div>
                        
                        {/* Unread count */}
                        {conversation.unread > 0 && (
                          <div className="ml-2 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {conversation.unread}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    // Empty state when no conversations match search/filter
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                      <MessagesSquare className="h-12 w-12 text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium">No conversations found</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {searchQuery ? "Try a different search term" : "Start a new conversation"}
                      </p>
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
                    {/* Chat header: back button on mobile, avatar, name, role, online status */}
                    <div className="p-3 border-b flex items-center justify-between">
                      <div className="flex items-center">
                        {/* Back button for mobile to close chat and show sidebar */}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="md:hidden mr-2"
                          onClick={() => setShowMobileChat(false)}
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </Button>
                        
                        {/* Avatar for selected conversation */}
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarFallback>
                            {conversations.find(c => c.id === selectedConversation)?.name.charAt(0)}
                          </AvatarFallback>
                          <AvatarImage 
                            src={conversations.find(c => c.id === selectedConversation)?.avatar} 
                          />
                        </Avatar>
                        
                        {/* Name and role for selected conversation */}
                        <div>
                          <h3 className="font-semibold text-sm">
                            {conversations.find(c => c.id === selectedConversation)?.name}
                          </h3>
                          <div className="flex items-center">
                            <Badge variant="outline" className={`text-xs ${getRoleColor(conversations.find(c => c.id === selectedConversation)?.role || "")}`}>
                              {conversations.find(c => c.id === selectedConversation)?.role}
                            </Badge>
                            <span className={`ml-2 text-xs ${conversations.find(c => c.id === selectedConversation)?.online ? 'text-green-500' : 'text-gray-500'}`}>
                              {conversations.find(c => c.id === selectedConversation)?.online ? 'Online' : 'Offline'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Call, video, and more buttons */}
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
                    
                    {/* Chat messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {getConversationMessages(selectedConversation).map(message => (
                        <div 
                          key={message.id} 
                          className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] ${message.isMe ? 'bg-primary text-white' : 'bg-gray-100'} rounded-lg px-4 py-2`}>
                            <div className="text-sm">{message.content}</div>
                            <div className={`text-xs mt-1 ${message.isMe ? 'text-primary-foreground/70' : 'text-gray-500'}`}>
                              {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Message input area */}
                    <div className="p-3 border-t">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon">
                          <Paperclip className="h-5 w-5" />
                        </Button>
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
                        <Button size="icon" onClick={handleSendMessage} disabled={!messageText.trim()}>
                          <Send className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  // Empty state when no conversations are selected
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <Users className="h-16 w-16 text-gray-300 mb-3" />
                    <h3 className="text-xl font-medium">Select a conversation</h3>
                    <p className="text-sm text-gray-500 mt-1 max-w-md">
                      Choose a conversation from the left or start a new one to begin messaging
                    </p>
                    {/* Button to start a new conversation */}
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