#!/usr/bin/env python3
"""Simulador seguro: envia telemetria marcada como simulada; não controla hardware."""
import argparse, os, random, time, uuid
from datetime import datetime, timezone
import httpx

def payload(device_id: str) -> dict:
    samples=random.randint(18,35); positives=random.choices([0,1,2,3],[55,25,15,5])[0]
    return {"device_id":device_id,"event_id":f"SIM-{uuid.uuid4()}","timestamp":datetime.now(timezone.utc).isoformat(),"temperature":round(random.uniform(30,37),1),"humidity":round(random.uniform(55,85),1),"varroa":{"samples_analyzed":samples,"positive_detections":min(positives,samples)},"formic_acid":{"reservoir_level_percent":round(random.uniform(35,95),1),"release_active":False},"simulated":True}
def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument("--url",default=os.getenv("BPS_WEBHOOK_URL","http://localhost:8000/api/v1/webhooks/esp32"));p.add_argument("--device-id",default=os.getenv("BPS_DEVICE_ID","BPS-001"));p.add_argument("--api-key",default=os.getenv("BPS_DEVICE_KEY"));p.add_argument("--interval",type=float,default=30);p.add_argument("--continuous",action="store_true");args=p.parse_args()
    if not args.api_key: raise SystemExit("Set BPS_DEVICE_KEY or pass --api-key")
    while True:
        body=payload(args.device_id);r=httpx.post(args.url,json=body,headers={"X-Device-Key":args.api_key},timeout=15);print(r.status_code,r.json())
        if not args.continuous: break
        time.sleep(max(args.interval,1))
if __name__=="__main__": main()

