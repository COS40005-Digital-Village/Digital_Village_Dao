"use client"

import { useState } from "react"
import {
  Activity,
  BarChart3,
  ChevronDown,
  Clock,
  CreditCard,
  Home,
  Layout,
  ListChecks,
  PieChart,
  Plus,
  Settings,
  Shield,
  Users,
  Vote,
  Wallet,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import ProposalDetailPage from "@/components/governance/ProposalDetailPage"
import GovernancePage from "@/components/governance/GovernancePage"
import TaskBoard from "@/components/tasks/TaskBoardPage"
import { Toaster } from 'sonner'

interface HomePageProps {
  setCurrentPage: (page: string) => void;
}

export default function DAOWireframe() {
  const [currentPage, setCurrentPage] = useState("home")
  const [selectedProposalId, setSelectedProposalId] = useState<string | undefined>(undefined);

  const handleViewProposal = (proposalId: string) => {
    setSelectedProposalId(proposalId);
    setCurrentPage("proposalDetail");
  };

  const handleBackToProposalsList = () => {
    setSelectedProposalId(undefined);
    setCurrentPage("proposal");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <h1 className="text-xl font-bold">DAO Platform</h1>
        </div>
        <div className="flex items-center gap-4">
          {currentPage !== "home" && (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/media/krobus.jpg" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">0x1a2...3b4c</span>
            </div>
          )}
          {currentPage === "home" ? (
            <Button onClick={() => setCurrentPage("dashboard")}>
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          ) : (
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex">
        {currentPage !== "home" && (
          <div className="w-64 border-r h-[calc(100vh-65px)] p-4">
            <nav className="space-y-2">
              <Button
                variant={currentPage === "dashboard" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setCurrentPage("dashboard")}
              >
                <Layout className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <Button
                variant={currentPage === "tasks" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setCurrentPage("tasks")}
              >
                <ListChecks className="mr-2 h-4 w-4" />
                Tasks
              </Button>
              <Button
                variant={currentPage === "proposal" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setCurrentPage("proposal")}
              >
                <Vote className="mr-2 h-4 w-4" />
                Governance
              </Button>
              <Button
                variant={currentPage === "token" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setCurrentPage("token")}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Token
              </Button>
              <Button
                variant={currentPage === "admin" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setCurrentPage("admin")}
              >
                <Shield className="mr-2 h-4 w-4" />
                Admin
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => setCurrentPage("home")}>
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </nav>
          </div>
        )}

        <div className="flex-1 p-6">
          {currentPage === "home" && <HomePage setCurrentPage={setCurrentPage} />}
          {currentPage === "dashboard" && <MemberDashboard />}
          {currentPage === "proposal" && <GovernancePage onViewProposal={handleViewProposal} />}
          {currentPage === "proposalDetail" && selectedProposalId && (
            <ProposalDetailPage 
              proposalId={selectedProposalId}
              onBackToProposals={handleBackToProposalsList} 
            />
          )}
          {currentPage === "token" && <TokenDashboard />}
          {currentPage === "tasks" && <TaskBoard />}
          {currentPage === "admin" && <AdminPanel />}
        </div>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  )
}

function HomePage({ setCurrentPage }: HomePageProps) {
  return (
    <div className="max-w-5xl mx-auto space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Decentralized Governance for the Future
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Join our community-driven organization and help shape the future through transparent, decentralized
          decision-making.
        </p>
        <Button size="lg" onClick={() => setCurrentPage("dashboard")}>
          <Wallet className="mr-2 h-5 w-5" />
          Connect Wallet
        </Button>
      </div>

      {/* Token Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Supply</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,000,000 DAO</div>
            <p className="text-xs text-muted-foreground">+2.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Holders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,245</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Voting Participation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">+5% from last proposal</p>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>1. Join the DAO</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Connect your wallet and acquire DAO tokens to become a member with voting rights.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>2. Participate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Contribute to discussions, complete tasks, and earn rewards for your participation.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Vote className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>3. Vote & Govern</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Vote on proposals and help shape the future direction of the organization.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Get Involved */}
      <div className="text-center space-y-6 py-8">
        <h2 className="text-2xl font-bold">Ready to Get Involved?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Join our community today and start contributing to the future of decentralized governance.
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={() => setCurrentPage("dashboard")}>Join Us</Button>
          <Button variant="outline" onClick={() => setCurrentPage("proposal")}>
            View Governance
          </Button>
        </div>
      </div>
    </div>
  )
}

function MemberDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left sidebar is already in the main layout */}

      {/* Center panel */}
      <div className="md:col-span-2 space-y-6">
        <h1 className="text-2xl font-bold">Member Dashboard</h1>

        <Card>
          <CardHeader>
            <CardTitle>Token Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">1,250 DAO</p>
                <p className="text-sm text-muted-foreground">≈ $3,750 USD</p>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Get More
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contribution Score</CardTitle>
            <CardDescription>Your activity and participation in the DAO</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">78/100</span>
                <span className="text-sm text-muted-foreground">Top 15%</span>
              </div>
              <Progress value={78} className="h-2" />
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <p className="font-medium">12</p>
                  <p className="text-muted-foreground">Proposals Voted</p>
                </div>
                <div>
                  <p className="font-medium">5</p>
                  <p className="text-muted-foreground">Tasks Completed</p>
                </div>
                <div>
                  <p className="font-medium">8</p>
                  <p className="text-muted-foreground">Comments Made</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Vote className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">New Proposal: Token Allocation Q3</p>
                  <p className="text-sm text-muted-foreground">Voting ends in 2 days</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <ListChecks className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Task Assigned: Website Content Review</p>
                  <p className="text-sm text-muted-foreground">Due in 5 days</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Reward Available: 50 DAO Tokens</p>
                  <p className="text-sm text-muted-foreground">For task completion</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right panel */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start">
              <Vote className="mr-2 h-4 w-4" />
              Vote Now (3 Active)
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              View Guild
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <CreditCard className="mr-2 h-4 w-4" />
              Claim Rewards
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-muted p-2 rounded-full">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Community Call</p>
                <p className="text-sm text-muted-foreground">Tomorrow, 3:00 PM UTC</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-muted p-2 rounded-full">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Governance Workshop</p>
                <p className="text-sm text-muted-foreground">Friday, 5:00 PM UTC</p>
              </div>
            </div>
            <Button variant="link" className="w-full">
              View All Events
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function TokenDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Token Dashboard</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Propose Budget Change
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart: Token inflows/outflows */}
        <Card>
          <CardHeader>
            <CardTitle>Token Flows</CardTitle>
            <CardDescription>Inflows and outflows over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center bg-muted/40 rounded-md">
              <BarChart3 className="h-16 w-16 text-muted-foreground/60" />
              <span className="sr-only">Line chart showing token inflows and outflows</span>
            </div>
          </CardContent>
        </Card>

        {/* Pie chart: Fund allocation */}
        <Card>
          <CardHeader>
            <CardTitle>Fund Allocation</CardTitle>
            <CardDescription>Current allocation by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center bg-muted/40 rounded-md">
              <PieChart className="h-16 w-16 text-muted-foreground/60" />
              <span className="sr-only">Pie chart showing fund allocation by category</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table: Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Last 30 days of token activity</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Jun 10, 2023</TableCell>
                <TableCell>Developer Bounty Payment</TableCell>
                <TableCell>Development</TableCell>
                <TableCell className="text-red-500">-5,000 DAO</TableCell>
                <TableCell>
                  <Badge variant="outline">Completed</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Jun 8, 2023</TableCell>
                <TableCell>Community Event Sponsorship</TableCell>
                <TableCell>Marketing</TableCell>
                <TableCell className="text-red-500">-2,500 DAO</TableCell>
                <TableCell>
                  <Badge variant="outline">Completed</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Jun 5, 2023</TableCell>
                <TableCell>Token Sale Revenue</TableCell>
                <TableCell>Income</TableCell>
                <TableCell className="text-green-500">+10,000 DAO</TableCell>
                <TableCell>
                  <Badge variant="outline">Completed</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Jun 1, 2023</TableCell>
                <TableCell>Server Infrastructure</TableCell>
                <TableCell>Operations</TableCell>
                <TableCell className="text-red-500">-1,200 DAO</TableCell>
                <TableCell>
                  <Badge variant="outline">Completed</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>May 28, 2023</TableCell>
                <TableCell>Community Rewards Distribution</TableCell>
                <TableCell>Rewards</TableCell>
                <TableCell className="text-red-500">-3,500 DAO</TableCell>
                <TableCell>
                  <Badge variant="outline">Completed</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div className="flex justify-center mt-4">
            <Button variant="outline" size="sm">
              Load More
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Token Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">985,000 DAO</div>
            <p className="text-xs text-muted-foreground">≈ $2,955,000 USD</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Burn Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42,500 DAO</div>
            <p className="text-xs text-muted-foreground">≈ $127,500 USD</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Runway</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23 Months</div>
            <p className="text-xs text-muted-foreground">At current burn rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Locked Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">250,000 DAO</div>
            <p className="text-xs text-muted-foreground">25% of total supply</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function AdminPanel() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Panel</h1>

      <Tabs defaultValue="members">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Input placeholder="Search members..." className="w-80" />
              <Button variant="outline">
                Filter by Role
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Guild</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Token Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/placeholder.svg" alt="User" />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">0x7a2...9b3c</p>
                          <p className="text-xs text-muted-foreground">Joined Apr 2023</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>Development</TableCell>
                    <TableCell>Admin</TableCell>
                    <TableCell>5,250 DAO</TableCell>
                    <TableCell>
                      <Badge>Active</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/placeholder.svg" alt="User" />
                          <AvatarFallback>AL</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">0x3f5...9a7b</p>
                          <p className="text-xs text-muted-foreground">Joined May 2023</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>Token</TableCell>
                    <TableCell>Guild Leader</TableCell>
                    <TableCell>3,800 DAO</TableCell>
                    <TableCell>
                      <Badge>Active</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/placeholder.svg" alt="User" />
                          <AvatarFallback>MK</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">0x6d2...1e8f</p>
                          <p className="text-xs text-muted-foreground">Joined Feb 2023</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>Documentation</TableCell>
                    <TableCell>Member</TableCell>
                    <TableCell>1,200 DAO</TableCell>
                    <TableCell>
                      <Badge>Active</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/placeholder.svg" alt="User" />
                          <AvatarFallback>SL</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">0x8b3...4c2d</p>
                          <p className="text-xs text-muted-foreground">Joined Jun 2023</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>Design</TableCell>
                    <TableCell>Guild Leader</TableCell>
                    <TableCell>2,750 DAO</TableCell>
                    <TableCell>
                      <Badge variant="outline">Inactive</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <div className="flex items-center justify-between p-4">
                <div className="text-sm text-muted-foreground">Showing 4 of 24 members</div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tokens Tab */}
        <TabsContent value="tokens" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Token Distribution</CardTitle>
                <CardDescription>Current allocation of DAO tokens</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-60 flex items-center justify-center bg-muted/40 rounded-md">
                  <PieChart className="h-16 w-16 text-muted-foreground/60" />
                  <span className="sr-only">Pie chart showing token distribution</span>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span>Community</span>
                    </div>
                    <span>40%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span>Token</span>
                    </div>
                    <span>30%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span>Team</span>
                    </div>
                    <span>20%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <span>Investors</span>
                    </div>
                    <span>10%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Token Settings</CardTitle>
                <CardDescription>Configure token parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Voting Threshold</Label>
                  <div className="flex items-center gap-4">
                    <Input type="number" defaultValue="100" />
                    <span className="text-sm text-muted-foreground">DAO tokens</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Minimum tokens required to create a proposal</p>
                </div>

                <div className="space-y-2">
                  <Label>Vesting Period</Label>
                  <div className="flex items-center gap-4">
                    <Input type="number" defaultValue="6" />
                    <span className="text-sm text-muted-foreground">months</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Time period for token vesting</p>
                </div>

                <div className="space-y-2">
                  <Label>Reward Rate</Label>
                  <div className="flex items-center gap-4">
                    <Input type="number" defaultValue="5" />
                    <span className="text-sm text-muted-foreground">DAO tokens per task</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Base rate for task rewards</p>
                </div>

                <Button>Save Settings</Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Whitelist Wallets</CardTitle>
                <CardDescription>Manage whitelisted wallet addresses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Input placeholder="Enter wallet address..." className="flex-1" />
                  <Button>Add Wallet</Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Wallet Address</TableHead>
                      <TableHead>Added By</TableHead>
                      <TableHead>Date Added</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>0x7a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b</TableCell>
                      <TableCell>0x7a2...9b3c</TableCell>
                      <TableCell>Jun 10, 2023</TableCell>
                      <TableCell>
                        <Badge>Active</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b</TableCell>
                      <TableCell>0x7a2...9b3c</TableCell>
                      <TableCell>Jun 8, 2023</TableCell>
                      <TableCell>
                        <Badge>Active</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>0x2a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b</TableCell>
                      <TableCell>0x3f5...9a7b</TableCell>
                      <TableCell>Jun 5, 2023</TableCell>
                      <TableCell>
                        <Badge>Active</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>DAO Configuration</CardTitle>
              <CardDescription>Manage general DAO settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>DAO Name</Label>
                <Input defaultValue="Example DAO" />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input defaultValue="A decentralized autonomous organization for community governance" />
              </div>

              <div className="space-y-2">
                <Label>Proposal Duration</Label>
                <div className="flex items-center gap-4">
                  <Input type="number" defaultValue="7" />
                  <span className="text-sm text-muted-foreground">days</span>
                </div>
                <p className="text-xs text-muted-foreground">Default duration for proposals</p>
              </div>

              <div className="space-y-2">
                <Label>Quorum</Label>
                <div className="flex items-center gap-4">
                  <Input type="number" defaultValue="20" />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
                <p className="text-xs text-muted-foreground">Minimum participation required for a proposal to pass</p>
              </div>

              <Button>Save Configuration</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
              <CardDescription>Configure external integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Blockchain Network</Label>
                <div className="flex items-center gap-4">
                  <Button variant="outline">
                    Ethereum Mainnet
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Governance Platform</Label>
                <div className="flex items-center gap-4">
                  <Button variant="outline">
                    Tally
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Multisig Wallet</Label>
                <Input defaultValue="0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b" />
              </div>

              <Button>Save Integration Settings</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Configure advanced DAO settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Voting System</Label>
                <div className="flex items-center gap-4">
                  <Button variant="outline">
                    Token-weighted
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Method used for calculating votes</p>
              </div>

              <div className="space-y-2">
                <Label>Proposal Threshold</Label>
                <div className="flex items-center gap-4">
                  <Input type="number" defaultValue="51" />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
                <p className="text-xs text-muted-foreground">Percentage of votes needed for a proposal to pass</p>
              </div>

              <div className="space-y-2">
                <Label>Emergency Pause</Label>
                <div className="flex items-center gap-4">
                  <Button variant="destructive">Pause DAO Operations</Button>
                </div>
                <p className="text-xs text-muted-foreground">Only use in case of emergency</p>
              </div>

              <Button>Save Advanced Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
