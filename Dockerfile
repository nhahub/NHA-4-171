FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["carSparePartSysProject/CarSparePartSysProject.csproj", "carSparePartSysProject/"]
COPY ["carSparePartSysProject.BL/CarSparePartSysProject.BL.csproj", "carSparePartSysProject.BL/"]
COPY ["carSparePartSysProject.DAL/CarSparePartSysProject.DAL.csproj", "carSparePartSysProject.DAL/"]
COPY ["carSparePartSysProject.Models/CarSparePartSysProject.Models.csproj", "carSparePartSysProject.Models/"]
RUN dotnet restore "carSparePartSysProject/CarSparePartSysProject.csproj"
COPY . .
WORKDIR "/src/carSparePartSysProject"
RUN dotnet build "CarSparePartSysProject.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "CarSparePartSysProject.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "CarSparePartSysProject.dll"]