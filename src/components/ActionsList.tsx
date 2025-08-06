import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

type Action =
    | { type: "suggestion"; suggestion: string }
    | { type: "reminder"; content: string; time: string }
    | { type: "add_to_goals"; goal: string };

interface ActionsListProps {
    actions: Action[];
    onClose?: () => void;
}

export function ActionsList({ actions, onClose }: ActionsListProps) {
    if (actions.length === 0) {
        return (
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>No Actions Recommended</CardTitle>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle>Recommended Actions</CardTitle>
                <CardDescription>Based on the data you submitted, here are some recommended actions:</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {actions.map((action, index) => (
                    <div key={index} className="border-l-4 border-primary pl-4 py-2">
                        {action.type === "suggestion" && (
                            <div>
                                <h4 className="font-semibold text-sm text-primary">💡 Suggestion</h4>
                                <p className="text-sm mt-1">{action.suggestion}</p>
                            </div>
                        )}
                        {action.type === "reminder" && (
                            <div>
                                <h4 className="font-semibold text-sm text-primary">⏰ Reminder</h4>
                                <p className="text-sm mt-1">{action.content}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Time: {new Date(action.time).toLocaleString()}
                                </p>
                            </div>
                        )}
                        {action.type === "add_to_goals" && (
                            <div>
                                <h4 className="font-semibold text-sm text-primary">🎯 New Goal</h4>
                                <p className="text-sm mt-1">{action.goal}</p>
                            </div>
                        )}
                    </div>
                ))}
                {onClose && (
                    <Button onClick={onClose} variant="outline" className="w-full mt-4">
                        Dismiss
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}