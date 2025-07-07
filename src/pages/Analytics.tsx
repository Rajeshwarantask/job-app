import { Job } from "@/types/Job";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from "recharts";
import { Briefcase, Calendar, CheckCircle, XCircle, Clock, TrendingUp, Building2, Globe, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useJobs } from "@/context/JobsContext";

const Analytics = () => {
  const { jobs } = useJobs();
  console.log(jobs); // <-- Add this
  const navigate = useNavigate();

  // Overall stats
  const overallStats = {
    total: jobs.length,
    applied: jobs.filter(job => job.status === 'applied').length,
    interviews: jobs.filter(job => job.status === 'interview').length,
    offers: jobs.filter(job => job.status === 'offer').length,
    rejected: jobs.filter(job => job.status === 'rejected').length,
    responseRate: jobs.length > 0 ? Math.round(((jobs.filter(job => job.status !== 'applied').length) / jobs.length) * 100) : 0
  };

  // Platform-wise statistics
  const platformStats = jobs.reduce((acc, job) => {
    if (!acc[job.platform]) {
      acc[job.platform] = {
        total: 0,
        applied: 0,
        interviews: 0,
        offers: 0,
        rejected: 0
      };
    }
    acc[job.platform].total++;
    acc[job.platform][job.status]++;
    return acc;
  }, {} as Record<string, any>);

  const platformData = Object.entries(platformStats).map(([platform, stats]) => ({
    platform,
    ...stats,
    responseRate: stats.total > 0 ? Math.round(((stats.total - stats.applied) / stats.total) * 100) : 0
  }));

  // Status distribution for pie chart
  const statusData = [
    { name: 'Applied', value: overallStats.applied, color: '#3B82F6' },
    { name: 'Interview', value: overallStats.interviews, color: '#8B5CF6' },
    { name: 'Offer', value: overallStats.offers, color: '#10B981' },
    { name: 'Rejected', value: overallStats.rejected, color: '#EF4444' }
  ].filter(item => item.value > 0);

  // Monthly application trend
  const monthlyData = jobs.reduce((acc, job) => {
    const month = new Date(job.applicationDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
    if (!acc[month]) {
      acc[month] = 0;
    }
    acc[month]++;
    return acc;
  }, {} as Record<string, number>);

  const trendData = Object.entries(monthlyData).map(([month, count]) => ({
    month,
    applications: count
  }));

  const chartConfig = {
    applications: { label: "Applications", color: "#3B82F6" },
    interviews: { label: "Interviews", color: "#8B5CF6" },
    offers: { label: "Offers", color: "#10B981" },
    rejected: { label: "Rejected", color: "#EF4444" }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="min-h-screen bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto p-6 space-y-6">
          {/* Back Button and Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="mb-4 text-white hover:bg-white/10 backdrop-blur-sm border border-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-gray-300">Comprehensive overview of your job application performance</p>
          </div>

          {/* Overall Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Total Applications</p>
                    <p className="text-2xl font-bold text-white">{overallStats.total}</p>
                  </div>
                  <Briefcase className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Applied</p>
                    <p className="text-2xl font-bold text-blue-400">{overallStats.applied}</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Interviews</p>
                    <p className="text-2xl font-bold text-purple-400">{overallStats.interviews}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Offers</p>
                    <p className="text-2xl font-bold text-green-400">{overallStats.offers}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Response Rate</p>
                    <p className="text-2xl font-bold text-orange-400">{overallStats.responseRate}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution Pie Chart */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Globe className="h-5 w-5" />
                  <span>Application Status Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Application Trend */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <TrendingUp className="h-5 w-5" />
                  <span>Application Trend</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <LineChart data={trendData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Line 
                      type="monotone" 
                      dataKey="applications" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6' }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Platform-wise Statistics */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Building2 className="h-5 w-5" />
                <span>Platform-wise Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {platformData.map((platform) => (
                  <div key={platform.platform} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white">{platform.platform}</h3>
                      <span className="text-sm bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full border border-blue-400/30">
                        {platform.total} total
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-400">{platform.applied}</p>
                        <p className="text-xs text-gray-300">Applied</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-400">{platform.interviews}</p>
                        <p className="text-xs text-gray-300">Interviews</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-400">{platform.offers}</p>
                        <p className="text-xs text-gray-300">Offers</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-400">{platform.rejected}</p>
                        <p className="text-xs text-gray-300">Rejected</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-400">{platform.responseRate}%</p>
                        <p className="text-xs text-gray-300">Response Rate</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Platform Comparison Chart */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <BarChart className="h-5 w-5" />
                <span>Platform Comparison</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <BarChart data={platformData}>
                  <XAxis dataKey="platform" />
                  <YAxis />
                  <Bar dataKey="applied" fill="#3B82F6" name="Applied" />
                  <Bar dataKey="interviews" fill="#8B5CF6" name="Interviews" />
                  <Bar dataKey="offers" fill="#10B981" name="Offers" />
                  <Bar dataKey="rejected" fill="#EF4444" name="Rejected" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
