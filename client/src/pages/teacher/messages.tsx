import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Send,
  User,
  Users,
  Bell,
  MessageSquare,
  Calendar,
  MoreVertical,
  Clock,
  Check,
  ArrowLeft,
  Phone,
  Video,
  FileText,
  Image as ImageIcon,
  Paperclip,
  Home,
  LayoutDashboard
} from "lucide-react";
import { format } from "date-fns";
import { cn, getInitials } from "@/lib/utils";
import { Link } from "wouter";

/**
 * @purpose Represents a contact in a messaging system, such as a student, teacher, parent, or admin. Contains information for displaying contact details in chat lists, including avatar, status, last message, and unread count.
 *
 * @param {number} id - Unique identifier of the contact.
 * @param {string} name - Full name of the contact.
 * @param {string} [avatar] - Optional URL of the contact's avatar image.
 * @param {string} [lastMessage] - Optional text of the last message exchanged.
 * @param {Date} [lastMessageTime] - Optional timestamp of the last message.
 * @param {number} [unread] - Optional count of unread messages.
 * @param {"online" | "offline" | "away"} [status] - Optional online status of the contact.
 * @param {"student" | "parent" | "admin" | "teacher"} role - Role of the contact.
 * @returns {Contact} Returns a structured Contact object for use in chat interfaces.
 * @throws {TypeError} Throws if required fields are missing or invalid when validated at runtime.
 * @sideEffects None. This interface only defines a data structure.
 *
 * @example
 * const contact: Contact = {
 *   id: 1,
 *   name: "John Doe",
 *   avatar: "https://example.com/avatar.jpg",
 *   lastMessage: "See you tomorrow!",
 *   lastMessageTime: new Date("2025-10-16T14:30:00Z"),
 *   unread: 2,
 *   status: "online",
 *   role: "student"
 * };
 */

interface Contact {
  id: number;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unread?: number;
  status?: "online" | "offline" | "away";
  role: "student" | "parent" | "admin" | "teacher";
}


/**
 * @purpose Represents a message sent between two contacts in the messaging system. Supports text content, attachments, read status, and timestamping.
 *
 * @param {number} id - Unique identifier of the message.
 * @param {number} senderId - ID of the contact sending the message.
 * @param {number} receiverId - ID of the contact receiving the message.
 * @param {string} content - The text content of the message.
 * @param {Date} timestamp - Date and time when the message was sent.
 * @param {boolean} read - Whether the message has been read.
 * @param {Array<{id: number, type: "image" | "file" | "audio", url: string, name: string}>} [attachments] - Optional list of message attachments.
 * @returns {Message} Returns a structured Message object for use in chat functionality.
 * @throws {TypeError} Throws if required fields are missing or of incorrect type during runtime validation.
 * @sideEffects None. This interface only defines a data structure.
 *
 * @example
 * const message: Message = {
 *   id: 101,
 *   senderId: 1,
 *   receiverId: 2,
 *   content: "Hello! Here's the document.",
 *   timestamp: new Date(),
 *   read: false,
 *   attachments: [
 *     {
 *       id: 1,
 *       type: "file",
 *       url: "https://example.com/file.pdf",
 *       name: "file.pdf"
 *     }
 *   ]
 * };
 */
interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: Date;
  read: boolean;
  attachments?: {
    id: number;
    type: "image" | "file" | "audio";
    url: string;
    name: string;
  }[];
}

/**
 * TeacherMessages Component
 *
 * @purpose Render the teacher messaging UI — contact list, message thread view, and composer allowing a teacher to view conversations, search contacts, select a contact, and compose/send messages (UI-only behavior shown in this file; actual send/receive API calls are expected elsewhere in the component).
 * 
 * @param None (the component reads required context via hooks such as `useAuth`)
 * @returns {JSX.Element} The rendered messaging UI for teachers (contact list, message thread, composer, dialogs).
 * @throws None
 * @sideEffects
 * - Reads authentication info via `useAuth()` (implicit side-effect of using a hook).
 * - Creates local React state for selected tab, query, selected contact, and new message.
 * - May trigger data fetching or mutations (e.g., loading contacts/messages or sending a message)
 *   when those parts of the component are implemented; such network effects are side-effects
 *   implied by the UI behavior.
 * - Updates React state in response to user interactions.
 *
 * @example
 * // Typical usage in a route or page:
 * import TeacherMessages from "@/components/teacher/TeacherMessages";
 *
 * export default function TeacherMessagesPage() {
 *   return (
 *     <AppShell>
 *       <PageHeader title="Messages" description="Communicate with students, parents and staff" />
 *       <TeacherMessages />
 *     </AppShell>
 *   );
 * }
 */
export default function TeacherMessages() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);


  /**
   * Fetch the list of conversation contacts for the authenticated user.
   *
   * @purpose
   * - Retrieve contacts with their last message, presence status, and unread message count.
   * - Provide placeholder data for UI rendering while API responses are pending.
   *
   * @param {number} [user?.id] - ID of the currently logged-in user.
   * @returns {Array<Object>} contacts - List of conversation contacts.
   * @returns {number} contacts[].id - Unique identifier of the contact.
   * @returns {string} contacts[].name - Full name of the contact.
   * @returns {string} contacts[].role - Role of the contact (e.g., "student", "parent", "teacher").
   * @returns {string} contacts[].lastMessage - Last message sent or received in the conversation.
   * @returns {Date} contacts[].lastMessageTime - Timestamp of the last message.
   * @returns {number} contacts[].unread - Number of unread messages.
   * @returns {string} contacts[].status - Presence status ("online", "offline", "away").
   * @throws {Error} Throws if the API request fails.
   * @sideEffects
   * - Triggers a network request to `/api/messages/contacts`.
   * - Updates React Query cache and causes re-render of consuming components.
   *
   * @example
   * const { data: contacts } = useQuery("/api/messages/contacts");
   * console.log(contacts[0].name); // "Rahul Sharma"
   */
  const { data: contacts = [], isLoading: isLoadingContacts } = useQuery<Contact[]>({
    queryKey: ["/api/messages/contacts"],
    enabled: !!user,
    placeholderData: [
      {
        id: 1,
        name: "Rahul Sharma",
        lastMessage: "Yes, I'll check the homework today",
        lastMessageTime: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
        unread: 0,
        status: "online",
        role: "parent"
      },
      {
        id: 2,
        name: "Ananya Patel",
        lastMessage: "Thank you for the feedback on my performance",
        lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        unread: 1,
        status: "offline",
        role: "student"
      },
      {
        id: 3,
        name: "Shreya Gupta",
        lastMessage: "When is the next class scheduled?",
        lastMessageTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        unread: 2,
        status: "away",
        role: "parent"
      },
      {
        id: 4,
        name: "Aditya Verma",
        lastMessage: "I'll be absent for tomorrow's class",
        lastMessageTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        unread: 0,
        status: "online",
        role: "student"
      },
      {
        id: 5,
        name: "Rajesh Kumar",
        lastMessage: "Please share the practice materials",
        lastMessageTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        unread: 0,
        status: "offline",
        role: "parent"
      }
    ]
  });


  /**
   * Fetch the messages for a selected contact in a conversation.
   *
   * @purpose
   * - Retrieve message history between the authenticated user and a selected contact.
   * - Provide placeholder data while waiting for API responses.
   *
   * @param {number} [selectedContact?.id] - ID of the contact whose messages should be fetched.
   * @param {number} [user?.id] - ID of the currently logged-in user.
   * @returns {Array<Object>} messages - List of messages for the selected conversation.
   * @returns {number} messages[].id - Unique identifier of the message.
   * @returns {number} messages[].senderId - ID of the message sender.
   * @returns {number} messages[].receiverId - ID of the message receiver.
   * @returns {string} messages[].content - Content of the message.
   * @returns {Date} messages[].timestamp - Timestamp of when the message was sent.
   * @returns {boolean} messages[].read - Whether the message has been read.
   * @returns {Array<Object>} [messages[].attachments] - Optional list of message attachments.
   * @returns {string} messages[].attachments[].type - Type of attachment (e.g., "file").
   * @returns {string} messages[].attachments[].url - URL to the attachment.
   * @returns {string} messages[].attachments[].name - Name of the attachment file.
   * @throws {Error} Throws if the API request fails.
   * @sideEffects
   * - Triggers a network request to `/api/messages/conversation` with the selected contact ID.
   * - Updates React Query cache and triggers re-rendering of message components.
   *
   * @example
   * const { data: messages } = useQuery(["/api/messages/conversation", selectedContact?.id]);
   * console.log(messages[0].content); // "Hello, I had a question about yesterday's class."
   */
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: ["/api/messages/conversation", selectedContact?.id],
    enabled: !!selectedContact,
    placeholderData: selectedContact ? [
      {
        id: 1,
        senderId: selectedContact.id,
        receiverId: user?.id || 0,
        content: "Hello, I had a question about yesterday's class.",
        timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        read: true
      },
      {
        id: 2,
        senderId: user?.id || 0,
        receiverId: selectedContact.id,
        content: "Hi there! Sure, what would you like to know?",
        timestamp: new Date(Date.now() - 55 * 60 * 1000), // 55 minutes ago
        read: true
      },
      {
        id: 3,
        senderId: selectedContact.id,
        receiverId: user?.id || 0,
        content: "Could you explain the music notation we covered? My child is having trouble understanding it.",
        timestamp: new Date(Date.now() - 50 * 60 * 1000), // 50 minutes ago
        read: true
      },
      {
        id: 4,
        senderId: user?.id || 0,
        receiverId: selectedContact.id,
        content: "Absolutely! The notation we covered was for reading rhythm patterns. I'll send you some practice sheets that might help.",
        timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        read: true
      },
      {
        id: 5,
        senderId: user?.id || 0,
        receiverId: selectedContact.id,
        content: "Here are the practice sheets we used in class.",
        timestamp: new Date(Date.now() - 44 * 60 * 1000), // 44 minutes ago
        read: true,
        attachments: [
          {
            id: 1,
            type: "file",
            url: "#",
            name: "rhythm_practice_sheet.pdf"
          }
        ]
      },
      {
        id: 6,
        senderId: selectedContact.id,
        receiverId: user?.id || 0,
        content: "Thank you so much! This is really helpful.",
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        read: true
      },
      {
        id: 7,
        senderId: selectedContact.id,
        receiverId: user?.id || 0,
        content: "One more thing - will there be a practice test before the recital?",
        timestamp: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
        read: false
      }
    ] : []
  });

  /**
   * Filtered contacts list (derived state)
   *
   * @purpose Provide a filtered list of contacts based on the current `searchQuery` and `selectedTab` (e.g. "all", "unread", "students", "parents").
   *
   * @param None
   * @returns {Contact[]} Array of contacts matching the search and tab filter.
   * @throws None
   * @sideEffects None — pure derivation from `contacts`, `searchQuery` and `selectedTab`.
   *
   * @example
   * // In JSX:
   * {filteredContacts.map(c => <ContactRow key={c.id} contact={c} />)}
   */
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = selectedTab === "all" ||
      (selectedTab === "unread" && (contact.unread || 0) > 0) ||
      (selectedTab === "students" && contact.role === "student") ||
      (selectedTab === "parents" && contact.role === "parent");
    return matchesSearch && matchesTab;
  });

  /**
   * Format a message timestamp for display in the conversation list.
   *
   * @purpose
   * Convert a Date timestamp into a friendly, relative/short label:
   * - Today  -> "h:mm a" (e.g. "3:45 PM")
   * - Yesterday -> "Yesterday"
   * - Within last 7 days -> day name (e.g. "Monday")
   * - Older -> "MMM d" (e.g. "Jan 15")
   *
   * @param {Date} timestamp - The Date object to format.
   * @returns {string} A human-friendly time string for UI display.
   * @throws None
   * (If an invalid Date is passed, behaviour falls back to Date parsing; no exception is thrown here.)
   * @sideEffects None — pure function.
   * 
   * @example
   * formatMessageTime(new Date('2025-10-03T15:45:00')); // "3:45 PM" (if today)
   */
  const formatMessageTime = (timestamp: Date) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffDays = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return format(messageDate, "h:mm a"); // Today: 3:45 PM
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return format(messageDate, "EEEE"); // Day of week: Monday
    } else {
      return format(messageDate, "MMM d"); // Month day: Jan 15
    }
  };

  /**
   * Handle sending a new message from the composer.
   *
   * @purpose Validate and dispatch a new message (UI-only here). In a real app this would call an API/mutation to persist and broadcast the message.
   *
   * @param None (uses closure state: `newMessage`, `selectedContact`, `user`)
   * @returns {void}
   * @throws None. This implementation does not throw. Network errors would be handled by the real API call implementation.
   * @sideEffects
   * - Logs the outgoing message to console (placeholder for API call).
   * - Clears the composer (`setNewMessage("")`).
   * - In a real implementation it would trigger: API call, optimistic update,
   *   and query/mutation invalidation or websocket broadcast.
   *
   * @example
   * // When user presses "Send":
   * handleSendMessage();
   */
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return;
    console.log("Sending message:", {
      content: newMessage,
      receiverId: selectedContact.id,
      senderId: user?.id
    });

    setNewMessage("");
  };

  return (
    // Appshell wraps the page with the header and sidebar
    <AppShell>
      {/* Link to teacher dashboard */}
      <div className="flex items-center mb-4">
        <Link href="/teacher/dashboard">
          <Button variant="ghost" size="sm" className="mr-2">
            {/* LayoutDashboard icon */}
            <LayoutDashboard className="h-4 w-4 mr-1" />
            Dashboard
          </Button>
        </Link>
      </div>

      {/* Page Header with title, description, and actions*/}
      <PageHeader
        title="Messages"
        description="Communicate with students, parents, and staff"
        actions={
          <Link href="/teacher/dashboard">
            {/* Back to Dashboard button */}
            <Button variant="outline" size="sm" className="gap-1">
              <LayoutDashboard className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        }
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contacts List */}
        <div className="md:col-span-1">
          {/* Contacts List Card */}
          <Card className="h-[calc(100vh-12rem)] shadow-md border-neutral-200">
            <CardHeader className="pb-2 bg-gradient-to-r from-primary/10 to-primary/5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <CardTitle>Conversations</CardTitle>
                </div>
                {/* New Message Button */}
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-white shadow-sm"
                  onClick={() => setShowNewMessageDialog(true)}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  New Message
                </Button>
              </div>
              <div className="mt-2">
                <div className="relative mb-2">
                  {/* Search Icon */}
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                  {/* Search Input for filtering contacts */}
                  <Input
                    type="text"
                    placeholder="Search conversations..."
                    className="pl-9 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {/* Tabs for filtering contacts */}
                <Tabs
                  defaultValue="all"
                  value={selectedTab}
                  onValueChange={setSelectedTab}
                  className="w-full"
                >
                  <TabsList className="w-full">
                    <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                    <TabsTrigger value="unread" className="flex-1">Unread</TabsTrigger>
                    <TabsTrigger value="students" className="flex-1">Students</TabsTrigger>
                    <TabsTrigger value="parents" className="flex-1">Parents</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            {/* Contacts List */}
            <CardContent className="p-0">
              {/* Scrollable area for the contact list */}
              <ScrollArea className="h-[calc(100vh-16rem)]">
                {/* Loading State */}
                {isLoadingContacts ? (
                  <div className="p-4 text-center text-neutral-500">
                    Loading conversations...
                  </div>
                ) : filteredContacts.length === 0 ? (
                  <div className="p-4 text-center text-neutral-500">
                    No conversations found
                  </div>
                ) : (
                  <div className="divide-y">
                    {/* Map through filtered contacts to display each one */}
                    {filteredContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className={cn(
                          "p-3 cursor-pointer hover:bg-neutral-50 transition-colors",
                          selectedContact?.id === contact.id && "bg-neutral-100"
                        )}
                        onClick={() => setSelectedContact(contact)}
                      >
                        {/* If found, show contact details */}
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {/* Avatar component */}
                            <Avatar>
                              <AvatarFallback>
                                {getInitials(contact.name)}
                              </AvatarFallback>
                            </Avatar>
                            {contact.status === "online" && (
                              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            {/* Contact name and last message time */}
                            <div className="flex justify-between">
                              <span className="font-medium">{contact.name}</span>
                              <span className="text-xs text-neutral-500">
                                {contact.lastMessageTime && formatMessageTime(contact.lastMessageTime)}
                              </span>
                            </div>
                            {/* Last message and unread count */}
                            <div className="flex justify-between items-center">
                              <p className="text-sm text-neutral-500 truncate">
                                {contact.lastMessage}
                              </p>
                              {/* Unread count */}
                              {(contact.unread || 0) > 0 && (
                                <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                                  {contact.unread}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Message Content Section */}
        <div className="md:col-span-2">
          <Card className="h-[calc(100vh-12rem)] shadow-md border-neutral-200">
            {/* Conditional rendering: if no contact is selected, show a placeholder */}
            {!selectedContact ? (
              <div className="h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-b from-neutral-50 to-white">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <MessageSquare className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-neutral-800">Your Messages</h3>
                <p className="max-w-md text-neutral-600">
                  Connect with students and parents through secure messaging
                </p>
                {/* Informational cards for selecting contact or new message */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
                  <div className="bg-white p-4 rounded-lg border border-neutral-200 flex flex-col items-center text-center">
                    <div className="bg-blue-50 p-2 rounded-full mb-2">
                      <Users className="h-5 w-5 text-blue-500" />
                    </div>
                    <h4 className="font-medium mb-1">Select Contact</h4>
                    <p className="text-sm text-neutral-500">Choose from your contacts list</p>
                  </div>
                  {/* New Message button placeholder */}
                  <div className="bg-white p-4 rounded-lg border border-neutral-200 flex flex-col items-center text-center">
                    <div className="bg-green-50 p-2 rounded-full mb-2">
                      <MessageSquare className="h-5 w-5 text-green-500" />
                    </div>
                    <h4 className="font-medium mb-1">New Message</h4>
                    <p className="text-sm text-neutral-500">Start a new conversation</p>
                  </div>
                </div>
                {/* Button to start a new conversation */}
                <Button
                  className="mt-6 bg-primary hover:bg-primary/90 text-white shadow-md"
                  onClick={() => setShowNewMessageDialog(true)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start New Conversation
                </Button>
              </div>
            ) : (
              // Display message thread if a contact is selected
              <>
                {/* Header of the message thread */}
                <CardHeader className="pb-2 border-b bg-gradient-to-r from-primary/10 to-primary/5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {/* Back button for mobile view */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setSelectedContact(null)}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      {/* Avatar of the selected contact */}
                      <Avatar className="border-2 border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(selectedContact.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        {/* Selected contact's name and online status */}
                        <CardTitle className="text-base flex items-center gap-2">
                          {selectedContact.name}
                          {selectedContact.status === "online" && (
                            <span className="inline-block h-2 w-2 rounded-full bg-green-500 ml-1"></span>
                          )}
                        </CardTitle>
                        {/* Selected contact's role and detailed status */}
                        <CardDescription className="text-xs flex items-center">
                          {selectedContact.role === "student" ? "Student" : "Parent"} •
                          <span className="ml-1 font-medium">
                            {selectedContact.status === "online" ? "Online" :
                              selectedContact.status === "away" ? "Away" : "Offline"}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                    {/* Action buttons for call, video, and more options */}
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Message Thread Content */}
                <div className="flex flex-col h-[calc(100vh-18rem)]">
                  <ScrollArea className="flex-1 p-4">
                    {/* Loading state for messages */}
                    {isLoadingMessages ? (
                      <div className="text-center text-neutral-500">
                        Loading messages...
                      </div>
                    ) : messages.length === 0 ? (
                      // No messages yet state
                      <div className="text-center text-neutral-500">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      // Display individual messages
                      <div className="space-y-4">
                        {messages.map((message) => {
                          const isOwnMessage = message.senderId === user?.id; // Check if the message is from the current user
                          return (
                            <div
                              key={message.id}
                              className={cn(
                                "flex",
                                isOwnMessage ? "justify-end" : "justify-start" // Align messages based on sender
                              )}
                            >
                              <div
                                className={cn(
                                  "max-w-[80%] rounded-lg p-3",
                                  isOwnMessage ?
                                    "bg-primary text-primary-foreground" : // Style for own messages
                                    "bg-neutral-100 text-neutral-900" // Style for other's messages
                                )}
                              >
                                <p className="text-sm">{message.content}</p>

                                {/* Display message attachments */}
                                {message.attachments && message.attachments.length > 0 && (
                                  <div className="mt-2 space-y-2">
                                    {message.attachments.map(attachment => (
                                      <div
                                        key={attachment.id}
                                        className={cn(
                                          "flex items-center gap-2 p-2 rounded",
                                          isOwnMessage ?
                                            "bg-primary-foreground/10" :
                                            "bg-white"
                                        )}
                                      >
                                        <FileText className="h-4 w-4" /> {/* File icon */}
                                        <span className="text-xs flex-1 truncate">
                                          {attachment.name} {/* Attachment file name */}
                                        </span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 px-2"
                                        >
                                          Download {/* Download button for attachment */}
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Message timestamp and read status */}
                                <div
                                  className={cn(
                                    "text-xs mt-1 flex items-center justify-end gap-1",
                                    isOwnMessage ?
                                      "text-primary-foreground/70" :
                                      "text-neutral-500"
                                  )}
                                >
                                  {format(new Date(message.timestamp), "h:mm a")} {/* Formatted message time */}
                                  {isOwnMessage && (
                                    <Check
                                      className={cn(
                                        "h-3 w-3 ml-1",
                                        message.read ? "text-green-500" : "" // Checkmark for read status
                                      )}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>

                  {/* Message Composer / Input Area */}
                  <div className="p-3 border-t bg-neutral-50">
                    <div className="flex gap-2 items-center">
                      <div className="flex gap-1">
                        {/* Button for attaching files */}
                        <Button variant="outline" size="icon" className="rounded-full h-9 w-9 border-neutral-300 hover:bg-primary/10">
                          <Paperclip className="h-4 w-4 text-neutral-600" />
                        </Button>
                      </div>
                      <div className="relative flex-1">
                        {/* Textarea for typing messages */}
                        <Textarea
                          placeholder="Type a message..."
                          className="min-h-10 resize-none pr-10 bg-white border-neutral-300 focus-visible:ring-primary rounded-lg shadow-sm"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) { // Send message on Enter key (without Shift)
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        {/* Send message button */}
                        <Button
                          size="icon"
                          disabled={!newMessage.trim()} // Disable if message is empty
                          onClick={handleSendMessage}
                          className="absolute right-2 bottom-2 h-6 w-6 rounded-full bg-primary hover:bg-primary/90 text-white"
                        >
                          <Send className="h-3 w-3" /> {/* Send icon */}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>

      {/* New Message Dialog */}
      <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
        {/* Dialog content */}
        <DialogContent>
          {/* Dialog header */}
          <DialogHeader>
            {/* Dialog title */}
            <DialogTitle>New Message</DialogTitle>
            {/* Dialog description */}
            <DialogDescription>
              Start a new conversation with a student or parent
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">To:</label>
              <div className="relative mt-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                {/* Input for searching contacts in the new message dialog */}
                <Input
                  type="text"
                  placeholder="Search students or parents..."
                  className="pl-9 w-full"
                />
              </div>
            </div>

            {/* Recent Contacts List in the new message dialog */}
            <div className="border rounded-lg">
              <div className="p-3 border-b">
                <h3 className="font-medium">Recent Contacts</h3>
              </div>
              <div className="divide-y max-h-60 overflow-y-auto">
                {/* Map through recent contacts */}
                {contacts.slice(0, 5).map(contact => (
                  <div
                    key={contact.id}
                    className="p-3 cursor-pointer hover:bg-neutral-50 flex items-center gap-3"
                    onClick={() => {
                      setSelectedContact(contact); // Select contact
                      setShowNewMessageDialog(false); // Close dialog
                    }}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(contact.name)} {/* Initials for avatar */}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{contact.name}</div> {/* Contact name */}
                      <div className="text-xs text-neutral-500">
                        {contact.role === "student" ? "Student" : "Parent"} {/* Contact role */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dialog action buttons */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewMessageDialog(false)}>
                Cancel
              </Button>
              <Button>Continue</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}