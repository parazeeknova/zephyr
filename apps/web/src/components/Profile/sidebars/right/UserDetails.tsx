"use client";

import GitHubIcon from "@mui/icons-material/GitHub";
import InstagramIcon from "@mui/icons-material/Instagram";
import RedditIcon from "@mui/icons-material/Reddit";
import TwitterIcon from "@mui/icons-material/Twitter";
import type React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ProfileCardProps {
  data: {
    name: string;
    role: string;
    avatar: string;
    followers: number;
    following: number;
    aura: number;
    bio: string;
    socialMedia: Array<{
      platform: string;
      username: string;
    }>;
  };
}

const ProfileCard: React.FC<ProfileCardProps> = ({ data }) => (
  <Card className="sticky top-0 bg-card text-card-foreground">
    <CardContent className="p-6">
      <div className="mb-4 flex items-center space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage
            src={data.avatar}
            alt={data.name}
            width={64}
            height={64}
          />
          <AvatarFallback>{data.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold text-xl">{data.name}</h2>
          <p className="text-muted-foreground">{data.role}</p>
        </div>
      </div>
      <div className="mb-4 flex justify-evenly">
        <div>
          <p className="font-semibold text-sm">Followers</p>
          <p className="pl-2 text-lg">{data.followers.toLocaleString()}</p>
        </div>
        <div>
          <p className="font-semibold text-sm">Following</p>
          <p className="pl-3 text-lg">{data.following.toLocaleString()}</p>
        </div>
        <div>
          <p className="font-semibold text-sm">Aura</p>
          <p className="pl-1 text-lg">{data.aura}</p>
        </div>
      </div>
      <p className="mb-4 text-center text-muted-foreground text-sm">
        {data.bio}
      </p>
      <div className="flex items-center justify-center">
        <Button className="mb-2 w-full max-w-xs bg-primary text-primary-foreground hover:bg-primary/90">
          Edit Profile
        </Button>
      </div>
      <div className="mt-2 mb-1 grid grid-cols-2 gap-2">
        {data.socialMedia.map((social, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="w-full justify-evenly"
          >
            {social.platform === "Twitter" && (
              <TwitterIcon className="mr-2 h-4 w-4" />
            )}
            {social.platform === "Instagram" && (
              <InstagramIcon className="mr-2 h-4 w-4" />
            )}
            {social.platform === "GitHub" && (
              <GitHubIcon className="mr-2 h-4 w-4" />
            )}
            {social.platform === "Reddit" && (
              <RedditIcon className="mr-2 h-4 w-4" />
            )}
            <span>{social.username}</span>
          </Button>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default ProfileCard;
