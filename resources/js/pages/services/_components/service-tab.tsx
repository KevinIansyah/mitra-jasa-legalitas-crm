import { TabsList, TabsTrigger } from '@/components/ui/tabs';

type TabItem = {
    value: string;
    label: string;
};

interface ServiceTabProps {
    tabs: TabItem[];
}

export function ServiceTab({ tabs }: ServiceTabProps) {
    return (
        <TabsList>
            {tabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                </TabsTrigger>
            ))}
        </TabsList>
    );
}
