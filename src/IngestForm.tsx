import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActionsList } from "@/components/ActionsList";
import {
    eventSchema,
    documentSchema,
    emailSchema,
    eventFormSchema,
    documentFormSchema,
    emailFormSchema,
    type EventPayload,
    type DocumentPayload,
    type EmailPayload,
    type IngestPayload,
    type EventFormData,
    type DocumentFormData,
    type EmailFormData,
} from "@/lib/schemas";

function EventForm() {
    const [actions, setActions] = useState<any[]>([]);
    const form = useForm<EventFormData>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: {
            type: "event",
            title: "",
            description: "",
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour later
            location: "",
            attendees: [],
        },
    });

    const { submit: generateEvent, isLoading: isGenerating, object, error } = useObject({
        api: "/api/generate/event",
        schema: eventFormSchema.omit({ type: true }),
        onError: (error) => {
            console.error("Generation error:", error);
        },
    });

    // Update form fields as the object streams in
    React.useEffect(() => {
        if (object) {
            console.log("Event generation object:", object);
            if (object.title) form.setValue("title", object.title);
            if (object.description) form.setValue("description", object.description);
            if (object.startTime) form.setValue("startTime", object.startTime);
            if (object.endTime) form.setValue("endTime", object.endTime);
            if (object.location !== undefined) form.setValue("location", object.location);
            if (object.attendees) form.setValue("attendees", (object.attendees || []).filter(Boolean) as string[]);
        }
    }, [object, form]);

    const mutation = useMutation({
        mutationFn: async (data: EventFormData) => {
            const response = await fetch("/api/ingest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to submit");
            }
            return response.json();
        },
        onSuccess: (data) => {
            form.reset();
            if (data.success && data.result?.actions) {
                setActions(data.result.actions);
            }
        },
        onError: (error) => {
            alert(`Error: ${error.message}`);
        },
    });

    function onSubmit(data: EventFormData) {
        mutation.mutate(data);
    }

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="flex justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                console.log("Starting event generation...");
                                generateEvent({});
                            }}
                            disabled={isGenerating}
                        >
                            <Sparkles className="mr-2 h-4 w-4" />
                            {isGenerating ? "Generating..." : "Auto-generate"}
                        </Button>
                    </div>
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Event Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Team Meeting" {...field} />
                                </FormControl>
                                <FormDescription>The title of the calendar event</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Discuss Q4 goals and project updates..." {...field} />
                                </FormControl>
                                <FormDescription>A detailed description of the event</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="startTime"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Start Time</FormLabel>
                                    <FormControl>
                                        <Input type="datetime-local" {...field} value={field.value.slice(0, 16)} onChange={(e) => field.onChange(e.target.value + ":00.000Z")} />
                                    </FormControl>
                                    <FormDescription>When the event starts</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="endTime"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>End Time</FormLabel>
                                    <FormControl>
                                        <Input type="datetime-local" {...field} value={field.value.slice(0, 16)} onChange={(e) => field.onChange(e.target.value + ":00.000Z")} />
                                    </FormControl>
                                    <FormDescription>When the event ends</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Location (optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Conference Room A" {...field} />
                                </FormControl>
                                <FormDescription>Where the event takes place</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="attendees"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Attendees (comma-separated emails)</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="john@example.com, jane@example.com"
                                        value={field.value?.join(", ") || ""}
                                        onChange={(e) => field.onChange(e.target.value.split(",").map((email) => email.trim()).filter(Boolean))}
                                    />
                                </FormControl>
                                <FormDescription>Email addresses of event attendees</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending ? "Submitting..." : "Submit Event"}
                    </Button>
                </form>
            </Form>
            {actions.length > 0 && (
                <ActionsList
                    actions={actions}
                    onClose={() => setActions([])}
                />
            )}
        </>
    );
}

function DocumentForm() {
    const [actions, setActions] = useState<any[]>([]);
    const form = useForm<DocumentFormData>({
        resolver: zodResolver(documentFormSchema),
        defaultValues: {
            type: "document",
            title: "",
            content: "",
            author: "",
            tags: [],
        },
    });

    const { submit: generateDocument, isLoading: isGenerating, object } = useObject({
        api: "/api/generate/document",
        schema: documentFormSchema.omit({ type: true }),
    });

    // Update form fields as the object streams in
    React.useEffect(() => {
        if (object) {
            if (object.title) form.setValue("title", object.title);
            if (object.content) form.setValue("content", object.content);
            if (object.author) form.setValue("author", object.author);
            if (object.tags) form.setValue("tags", (object.tags || []).filter(Boolean) as string[]);
        }
    }, [object, form]);

    const mutation = useMutation({
        mutationFn: async (data: DocumentFormData) => {
            const response = await fetch("/api/ingest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to submit");
            }
            return response.json();
        },
        onSuccess: (data) => {
            form.reset();
            if (data.success && data.result?.actions) {
                setActions(data.result.actions);
            }
        },
        onError: (error) => {
            alert(`Error: ${error.message}`);
        },
    });

    function onSubmit(data: DocumentFormData) {
        mutation.mutate(data);
    }

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="flex justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => generateDocument({})}
                            disabled={isGenerating}
                        >
                            <Sparkles className="mr-2 h-4 w-4" />
                            {isGenerating ? "Generating..." : "Auto-generate"}
                        </Button>
                    </div>
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Document Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="My Document" {...field} />
                                </FormControl>
                                <FormDescription>The title of the document</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="author"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Author</FormLabel>
                                <FormControl>
                                    <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormDescription>The author of the document</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Content</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Enter document content..." {...field} />
                                </FormControl>
                                <FormDescription>The main content of the document</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="tags"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tags (comma-separated)</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="tag1, tag2, tag3"
                                        value={field.value?.join(", ") || ""}
                                        onChange={(e) => field.onChange(e.target.value.split(",").map((tag) => tag.trim()).filter(Boolean))}
                                    />
                                </FormControl>
                                <FormDescription>Optional tags for categorization</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending ? "Submitting..." : "Submit Document"}
                    </Button>
                </form>
            </Form>
            {actions.length > 0 && (
                <ActionsList
                    actions={actions}
                    onClose={() => setActions([])}
                />
            )}
        </>
    );
}

function EmailForm() {
    const [actions, setActions] = useState<any[]>([]);
    const form = useForm<EmailFormData>({
        resolver: zodResolver(emailFormSchema),
        defaultValues: {
            type: "email",
            to: "",
            from: "",
            subject: "",
            body: "",
            cc: [],
        },
    });

    const { submit: generateEmail, isLoading: isGenerating, object } = useObject({
        api: "/api/generate/email",
        schema: emailFormSchema.omit({ type: true }),
    });

    // Update form fields as the object streams in
    React.useEffect(() => {
        if (object) {
            if (object.to) form.setValue("to", object.to);
            if (object.from) form.setValue("from", object.from);
            if (object.subject) form.setValue("subject", object.subject);
            if (object.body) form.setValue("body", object.body);
            if (object.cc) form.setValue("cc", (object.cc || []).filter(Boolean) as string[]);
        }
    }, [object, form]);

    const mutation = useMutation({
        mutationFn: async (data: EmailFormData) => {
            const response = await fetch("/api/ingest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to submit");
            }
            return response.json();
        },
        onSuccess: (data) => {
            form.reset();
            if (data.success && data.result?.actions) {
                setActions(data.result.actions);
            }
        },
        onError: (error) => {
            alert(`Error: ${error.message}`);
        },
    });

    function onSubmit(data: EmailFormData) {
        mutation.mutate(data);
    }

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="flex justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => generateEmail({})}
                            disabled={isGenerating}
                        >
                            <Sparkles className="mr-2 h-4 w-4" />
                            {isGenerating ? "Generating..." : "Auto-generate"}
                        </Button>
                    </div>
                    <FormField
                        control={form.control}
                        name="from"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>From</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="sender@example.com" {...field} />
                                </FormControl>
                                <FormDescription>Sender's email address</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="to"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>To</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="recipient@example.com" {...field} />
                                </FormControl>
                                <FormDescription>Recipient's email address</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="cc"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>CC (comma-separated)</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="cc1@example.com, cc2@example.com"
                                        value={field.value?.join(", ") || ""}
                                        onChange={(e) => field.onChange(e.target.value.split(",").map((email) => email.trim()).filter(Boolean))}
                                    />
                                </FormControl>
                                <FormDescription>Optional CC recipients</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Subject</FormLabel>
                                <FormControl>
                                    <Input placeholder="Email subject" {...field} />
                                </FormControl>
                                <FormDescription>The subject line of the email</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="body"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Body</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Enter email body..." {...field} className="min-h-[120px]" />
                                </FormControl>
                                <FormDescription>The main content of the email</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending ? "Submitting..." : "Submit Email"}
                    </Button>
                </form>
            </Form>
            {actions.length > 0 && (
                <ActionsList
                    actions={actions}
                    onClose={() => setActions([])}
                />
            )}
        </>
    );
}

export function IngestForm() {
    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Data Ingestion</CardTitle>
                <CardDescription>Submit different types of data for processing</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="event" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="event">Event</TabsTrigger>
                        <TabsTrigger value="document">Document</TabsTrigger>
                        <TabsTrigger value="email">Email</TabsTrigger>
                    </TabsList>
                    <TabsContent value="event" className="mt-6">
                        <EventForm />
                    </TabsContent>
                    <TabsContent value="document" className="mt-6">
                        <DocumentForm />
                    </TabsContent>
                    <TabsContent value="email" className="mt-6">
                        <EmailForm />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}