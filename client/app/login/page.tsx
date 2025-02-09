import Wallet from "../_components/Wallet";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Brain } from 'lucide-react';

export default function Login() {
    return (
      <div className="flex justify-center h-screen">
        <Card className="w-fit m-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <p className="text-6xl pr-4">ChainBrian</p>
              <Brain size={64}/>
            </CardTitle>
            <CardDescription>ChainBrian is a Decentralized AI Agent</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pt-5">
            <Wallet />
          </CardContent>
          <CardFooter>
            <p className="text-xs">All rights reserved ©</p>
          </CardFooter>
        </Card>
      </div>
    );
}
 
