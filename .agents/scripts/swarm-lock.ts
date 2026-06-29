import fs from "fs";
import path from "path";

const action = process.argv[2]; // 'acquire' | 'release'
const lockType = process.argv[3]; // 'tophat' | 'global-pivot'

if (!action || !lockType) {
  console.log(
    JSON.stringify({
      decision: "deny",
      reason: "[LOCK_ENGINE_ERROR]: Missing arguments",
    }),
  );
  process.exit(0);
}

const lockDir = path.join(process.cwd(), ".git", "locks");
const lockFile = path.join(lockDir, `${lockType}.lock`);

// Cross-platform directory synchronization
if (!fs.existsSync(lockDir)) {
  fs.mkdirSync(lockDir, { recursive: true });
}

// Map metadata payloads dynamically
const lockMetadata: Record<
  string,
  { success: string; deny: string; release: string }
> = {
  tophat: {
    success: "File system lock verified",
    deny: "File system locked by another agent",
    release: "Context lock released",
  },
  "global-pivot": {
    success: "Global lock engaged. Swarm halted for foundation rewrite.",
    deny: "Critical foundation rewrite in progress. Please wait.",
    release: "Global lock released. Swarm active.",
  },
};

const meta = lockMetadata[lockType] || {
  success: "Lock verified",
  deny: "Resource locked",
  release: "Lock released",
};

if (action === "acquire") {
  try {
    // Atomic file creation ('wx' flag throws if file exists across all OS types)
    fs.writeFileSync(lockFile, process.pid.toString(), { flag: "wx" });
    console.log(JSON.stringify({ decision: "allow", reason: meta.success }));
  } catch (err: any) {
    if (err.code === "EEXIST") {
      console.log(JSON.stringify({ decision: "deny", reason: meta.deny }));
    } else {
      // Fail-open strategy to prevent permanent repository lockouts on system anomalies
      console.log(
        JSON.stringify({
          decision: "allow",
          reason: `Bypassed lock due to internal FS exception: ${err.message}`,
        }),
      );
    }
  }
} else if (action === "release") {
  try {
    if (fs.existsSync(lockFile)) {
      fs.unlinkSync(lockFile);
    }
    console.log(JSON.stringify({ decision: "allow", reason: meta.release }));
  } catch (err) {
    console.log(JSON.stringify({ decision: "allow" }));
  }
}
