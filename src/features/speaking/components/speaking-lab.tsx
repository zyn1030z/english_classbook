"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic2, Ear, MessageSquare } from "lucide-react";
import { SpeakingPractice } from "./speaking-practice";
import { ShadowingMode } from "./shadowing-mode";
import { RoleplayMode } from "./roleplay-mode";
import type { SpeakingQuestion, ShadowingSentence, RoleplayScenario } from "@/features/speaking/actions";

interface SpeakingLabProps {
  questions: SpeakingQuestion[];
  shadowingSentences: ShadowingSentence[];
  roleplayScenarios: RoleplayScenario[];
}

export function SpeakingLab({ questions, shadowingSentences, roleplayScenarios }: SpeakingLabProps) {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="qa" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 p-1 bg-muted/40 dark:bg-white/5 rounded-xl">
          <TabsTrigger value="qa" className="rounded-lg data-[state=active]:bg-background dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm">
            <Mic2 className="h-4 w-4 mr-2" />
            Q&A
          </TabsTrigger>
          <TabsTrigger value="shadowing" className="rounded-lg data-[state=active]:bg-background dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm">
            <Ear className="h-4 w-4 mr-2" />
            Shadowing
          </TabsTrigger>
          <TabsTrigger value="roleplay" className="rounded-lg data-[state=active]:bg-background dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            Roleplay
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="qa" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            <SpeakingPractice questions={questions} />
          </TabsContent>
          <TabsContent value="shadowing" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            <ShadowingMode sentences={shadowingSentences} />
          </TabsContent>
          <TabsContent value="roleplay" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            <RoleplayMode scenarios={roleplayScenarios} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
