import { TabsList, TabsTrigger } from '@/components/ui/tabs';

type TabItem = {
    value: string;
    label: string;
};

interface BlogTagProps {
    tabs: TabItem[];
}

export function BlogTab({ tabs }: BlogTagProps) {
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
