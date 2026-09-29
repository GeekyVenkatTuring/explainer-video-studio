#!/usr/bin/env python3
"""Daily Trading Algorithms — captioned Kokoro build, prefix dta.
Facts/numbers are restricted to RESEARCH.md. Strategy diagrams are synthetic illustrations.
"""
import json, os, subprocess
import soundfile as sf
from kokoro_onnx import Kokoro
KOKORO_MODEL=os.path.expanduser("~/.cache/hyperframes/tts/models/kokoro-v1.0.onnx")
KOKORO_VOICES=os.path.expanduser("~/.cache/hyperframes/tts/voices/voices-v1.0.bin")
VOICE, LANG, GAP, PAUSE, ATEMPO, PREFIX="af_bella","en-us",0.5,0.6,0.95,"dta"
ROOT=os.path.dirname(os.path.abspath(__file__)); REPO=os.path.abspath(os.path.join(ROOT,"..","..")); PUBLIC=os.path.join(REPO,"composer","public",PREFIX)
RAW=os.path.join(ROOT,"assets","raw"); FIN=os.path.join(ROOT,"assets"); _K=None
for d in (PUBLIC,RAW,FIN,os.path.join(ROOT,"artifacts"),os.path.join(ROOT,"qa")): os.makedirs(d,exist_ok=True)
def kokoro():
 global _K
 if _K is None: _K=Kokoro(KOKORO_MODEL,KOKORO_VOICES)
 return _K
def dur(x): return round(float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=noprint_wrappers=1:nokey=1",x],capture_output=True,text=True,check=True).stdout),3)
def gen(sid,text):
 out=os.path.join(FIN,sid+".wav")
 if os.path.exists(out): return out,dur(out)
 parts=[x.strip() for x in text.split("[pause]") if x.strip()]; files=[]
 for i,part in enumerate(parts):
  f=os.path.join(RAW,f"{sid}_{i}.wav"); files.append(f)
  if not os.path.exists(f):
   samples,sr=kokoro().create(part,voice=VOICE,speed=1.0,lang=LANG); sf.write(f,samples,sr,subtype="PCM_16")
 sil=os.path.join(RAW,"pause.wav")
 if not os.path.exists(sil): subprocess.run(["ffmpeg","-y","-f","lavfi","-i","anullsrc=r=24000:cl=mono","-t",str(PAUSE),sil],check=True,capture_output=True)
 lst=os.path.join(RAW,sid+".txt")
 with open(lst,"w") as h:
  for i,f in enumerate(files): h.write(f"file '{f}'\n"+(f"file '{sil}'\n" if i<len(files)-1 else ""))
 subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i",lst,"-filter:a",f"atempo={ATEMPO}",out],check=True,capture_output=True)
 return out,dur(out)
CYAN,GREEN,AMBER,VIOLET,ROSE="#38BDF8","#34D399","#FBBF24","#A78BFA","#FB7185"
def n(s): return s
SEGMENTS=[
("b01","dta_title",{},n("Daily trading algorithms. [pause] How machines trade, and the India reality. [pause] This is an educational map of rules, execution, risk, and limits. [pause] It is not a promise of profit.")),
("b02","dta_hook",{},n("An order reaches an exchange. [pause] Was it a person clicking a button? [pause] Or a rule that a computer followed without emotion? [pause] By financial year twenty twenty-four, twelve point eight percent of N S E cash-market gross turnover was classified as algo. [pause] That is not a claim about all Indian trading. [pause] It is one scoped exchange measure. [pause] In this video, we unpack what the machines actually do.")),
("b03","dta_divider",{"n":1,"title":"The Anatomy","sub":"What a rule actually does","color":CYAN,"pips":4},n("Part one. The anatomy. [pause] An algorithm is not a magic prediction. [pause] It is a repeatable chain of decisions.")),
("b04","dta_anatomy",{},n("A daily algo begins with data. [pause] It turns data into a signal. [pause] Then risk checks decide whether the signal deserves an order. [pause] The broker routes the order. [pause] The exchange matches it. [pause] Fills return to the system. [pause] So the loop is data, signal, risk, order, fill. [pause] Every serious system also watches the loop, because a correct idea can still fail through bad data, a rejected order, or a runaway process.")),
("b05","dta_algomarket",{},n("Algo trading is a broad category. [pause] High-frequency trading is a faster, latency-sensitive subset. [pause] Direct market access is an institutional route through a broker. [pause] Co-location means systems are placed near exchange infrastructure to reduce delay. [pause] These labels are not interchangeable. [pause] On N S E cash market in financial year twenty twenty-four, algo was twelve point eight percent of gross turnover. [pause] Co-location was thirty-four point three percent, and it is not an algo share. [pause] The I M F said algo was about seventy percent of U S equities trading in October twenty twenty-four. [pause] That figure is U S only.")),
("b06","dta_taxonomy",{},n("Most daily strategies are simple rule families. [pause] Momentum follows a move. [pause] Mean reversion bets a stretched move may return toward average. [pause] Breakout trades a range boundary. [pause] V W A P and T W A P split a large order. [pause] Market making quotes both sides. [pause] Arbitrage compares related prices. [pause] A rule is not an edge merely because it has a name. [pause] It needs suitable data, a tested condition, risk limits, and execution that survives its costs.")),
("b07","dta_divider",{"n":2,"title":"The Strategies","sub":"Illustrative rules on synthetic data","color":GREEN,"pips":4},n("Part two. The strategies. [pause] These charts use illustrative synthetic data. [pause] They are not backtests, history, or recommendations.")),
("b08","dta_momentum",{},n("Momentum asks whether a move is persistent. [pause] One common rule compares a fast moving average with a slow moving average. [pause] When the fast line rises above the slow line, the rule can permit a long position. [pause] When it falls back below, the rule exits or reverses. [pause] The chart is illustrative synthetic data. [pause] Its failure mode is chop. [pause] In a sideways market, repeated crosses create whipsaws. [pause] The system pays spread, slippage, and charges while repeatedly being wrong.")),
("b09","dta_meanrev",{},n("Mean reversion starts from a different belief. [pause] A price far from its recent average may move back toward it. [pause] Bollinger bands frame a moving average with volatility bands. [pause] R S I is an oscillator from zero to one hundred. [pause] A low reading or lower-band poke can become an entry condition. [pause] The chart is illustrative synthetic data. [pause] But a strong trend can keep going. [pause] Cheap can become cheaper. [pause] A band is a measurement, not a floor.")),
("b10","dta_pairs",{},n("Pairs trading compares two related series. [pause] The algo measures their spread, then a z-score describes how unusual that spread is against its recent history. [pause] A rule may act when the absolute z-score exceeds two. [pause] It goes long one leg and short the other, expecting the relationship to normalize. [pause] The chart is illustrative synthetic data. [pause] The real danger is a broken relationship. [pause] A sector shock, company event, or changing business model can make yesterday's pair irrelevant.")),
("b11","dta_breakout",{},n("Opening-range breakout defines a first trading window. [pause] Its high and low become boundaries. [pause] If price crosses above the high, a long rule may activate. [pause] If it crosses below the low, a short rule may activate. [pause] A stop defines failure before the order is sent. [pause] The chart is illustrative synthetic data. [pause] Opening noise, headline gaps, and false breakouts are the core danger. [pause] A boundary crossed once is not a guaranteed trend.")),
("b12","dta_vwap",{},n("V W A P means volume-weighted average price. [pause] It is an execution benchmark, not automatically a directional bet. [pause] A large parent order can be divided into child orders. [pause] T W A P spaces those slices through time. [pause] A V W A P schedule responds to traded volume. [pause] The goal is to reduce impact and compare fills fairly. [pause] The chart is illustrative synthetic data. [pause] Poor volume forecasts, information leakage, missed fills, and market impact can still make execution expensive.")),
("b13","dta_making",{},n("Market makers quote a bid and an ask. [pause] They can earn spread when both sides trade, while controlling inventory. [pause] Their danger is adverse selection: informed flow can trade against a stale quote. [pause] Arbitrage instead compares related prices, such as cash and futures. [pause] It buys one and sells the other only if the spread survives every cost and constraint. [pause] Legging, funding, limits, taxes, and execution can erase an apparent spread. [pause] Small theoretical profits attract fast competition.")),
("b14","dta_divider",{"n":3,"title":"The India Reality","sub":"Retail API rules and costs","color":AMBER,"pips":4},n("Part three. The India reality. [pause] An API bot operates inside a broker and exchange rulebook.")),
("b15","dta_sebi",{},n("S E B I issued the retail algo framework on four February twenty twenty-five. [pause] Under its glide path, the framework applies to all stockbrokers from one April twenty twenty-six. [pause] N S E's documented threshold is ten orders per second per exchange and segment. [pause] At or below that threshold, an API algo gets a generic Algo I D. [pause] Above it, the algo must register. [pause] Access needs a unique key, broker-whitelisted static I P, OAuth, two-factor authentication, and daily logout. [pause] Broker is principal. Provider is agent. [pause] Audit trail is kept at least five years.")),
("b16","dta_costs",{},n("Costs decide whether a fast strategy survives. [pause] From one April twenty twenty-six, sell-side securities futures S T T is zero point zero five percent. [pause] Option-sale S T T is zero point one five percent of premium. [pause] A Zerodha example lists futures brokerage at zero point zero three percent or twenty rupees per order, whichever is lower. [pause] Options are twenty rupees per executed order. [pause] That is one broker example, not all brokers. [pause] N S E transaction charges and G S T add more. [pause] Spread, impact, delay, and missed fills are implicit costs. [pause] Gross return is not net return.")),
("b17","dta_reality",{},n("Here is the uncomfortable scope-labelled evidence. [pause] S E B I said ninety-three percent of over one crore individual equity futures and options traders lost money between financial year twenty twenty-two and twenty twenty-four. [pause] Aggregate losses exceeded one point eight lakh crore rupees. [pause] Only one percent made more than one lakh rupees after costs. [pause] The financial year twenty twenty-four average transaction cost was twenty-six thousand rupees per individual trader. [pause] This is an individual F and O study, not an algo-user profitability study. [pause] Automation does not create edge. [pause] Backtest does not equal live trading. [pause] Retail API does not equal H F T.")),
("b18","dta_divider",{"n":4,"title":"Build & Run One","sub":"Test, control, monitor","color":VIOLET,"pips":4},n("Part four. Build and run one. [pause] The code is only one component. [pause] Controls make it a trading system.")),
("b19","dta_stack",{},n("The real stack starts with market data and instrument information. [pause] Validate stale feeds, timestamps, missing values, and market status. [pause] Calculate the signal. [pause] Convert it into a desired position. [pause] Then risk checks cap cash, margin, exposure, order size, and daily loss. [pause] An order-management system creates child orders. [pause] The broker API routes tagged orders. [pause] The exchange sends acknowledgements and fills. [pause] Monitoring compares intent with reality. [pause] A kill switch is part of the design, not an emergency decoration.")),
("b20","dta_backtest",{},n("A backtest replays historical data under assumptions. [pause] It should separate train, validation, and test periods. [pause] It must avoid look-ahead and survivorship bias. [pause] It must model charges, spread, slippage, partial fills, and changing liquidity. [pause] An overfit curve can look perfect in sample, then flatten or fail in walk-forward trading. [pause] The chart is illustrative synthetic data. [pause] Live trading adds current queue position, outages, rejected orders, and market regimes that historical tests cannot fully recreate.")),
("b21","dta_code",{},n("Pseudo-code should read like an accountable decision. [pause] First calculate a fast and slow average. [pause] If the fast average is above the slow average, propose a position. [pause] Do not send it yet. [pause] Check cash and margin. [pause] Check maximum order size. [pause] Check the daily loss limit. [pause] Check the instrument is tradable and the data is fresh. [pause] Only then send the tagged order. [pause] If any check fails, reject and alert. [pause] The strongest line of code is often the one that prevents a trade.")),
("b22","dta_live",{},n("Going live begins smaller than a backtest fantasy. [pause] Paper-trade first. [pause] Use conservative position sizing. [pause] Watch for stale data, rejected orders, duplicate orders, latency spikes, unexpected exposure, and daily-loss breaches. [pause] Reconcile exchange acknowledgements with the intended position. [pause] Alerts need an owner. [pause] A kill switch needs a tested path. [pause] Discipline matters more than clever code, because a live system trades the actual market, not a chart frozen in hindsight.")),
("b23","dta_rules",{},n("Keep five rules. [pause] Model all explicit and implicit costs. [pause] Test out of sample, not only where you tuned the rule. [pause] Size small enough that a normal loss is survivable. [pause] Monitor every live component. [pause] Treat promised, expected, or unverified past-return marketing as a red flag. [pause] S E B I's restriction is nuanced: it does not mean all performance discussion is banned. [pause] It does mean brokers and platforms cannot make those unverified return references, subject to the specified verified-metrics route.")),
("b24","dta_recap",{"items":["Data → signal → risk → order → fill","HFT is a subset, not every algo","Synthetic examples are not backtests","Costs decide if turnover survives","Retail APIs have SEBI/NSE controls","Automation is not an edge","Monitor and stop"],"closer":"Build systems that can say no."},n("So the whole map is this. [pause] A trading algorithm is a rule connected to data, risk, routing, and monitoring. [pause] Strategies differ, but all can fail through costs, bad assumptions, or a changing market. [pause] India adds broker, API, identity, tagging, and audit controls. [pause] Automation is not edge. [pause] Educational information from public sources, not investment advice. Consult a S E B I-registered adviser. [pause] Thanks for watching."))]
CHAPTERS=[range(0,4),range(4,6),range(6,9),range(9,11),range(11,13),range(13,17),range(17,20),range(20,24)]
# Extra teaching depth for the 22-minute calibration. It adds no new factual claims or figures.
DEPTH={
"b01":" [pause] We will separate a useful tool from a seductive story. [pause] The goal is not to find a magic bot. [pause] The goal is to understand the complete decision chain.",
"b02":" [pause] A human can use the same rule manually. [pause] Automation changes repeatability and speed. [pause] It does not change what the rule knows, or what the market can do next.",
"b03":" [pause] Keep this map in mind through every strategy. [pause] If one link is missing, the system is incomplete. [pause] A signal alone is only an opinion.",
"b04":" [pause] This chain also explains why daily algos are more than a chart indicator. [pause] A chart can suggest. [pause] Risk decides. [pause] Routing executes. [pause] Monitoring checks that reality matches the plan.",
"b05":" [pause] For a retail learner, the useful question is not who is fastest. [pause] It is what kind of system you are actually describing. [pause] Execution speed, access route, and trading logic are separate choices.",
"b06":" [pause] Think of these as different answers to one question. [pause] Do you expect continuation, reversal, a range break, cheaper execution, liquidity provision, or a temporary price mismatch? [pause] Then define exactly when that answer is wrong.",
"b07":" [pause] Synthetic examples let us see the rule clearly. [pause] They do not show a return. [pause] Real markets add noise, queues, spreads, gaps, and competition.",
"b08":" [pause] The important discipline is consistency. [pause] A trend follower cannot celebrate one winner and skip the next valid signal. [pause] That would replace a rule with hindsight. [pause] The rule needs a position size and a loss limit too.",
"b09":" [pause] Mean reversion needs a definition of normal. [pause] That definition is always historical and imperfect. [pause] Before trading it, ask what news or regime could make the old average irrelevant.",
"b10":" [pause] A pair is not safe merely because it has moved together before. [pause] The model needs synchronized data, a clear hedge rule, and a way to exit when the spread keeps widening. [pause] Neutral-looking positions still carry risk.",
"b11":" [pause] A breakout rule must decide its range before the break. [pause] It must decide its stop before the entry. [pause] Otherwise the system is just reacting after the emotional part of the move has arrived.",
"b12":" [pause] This distinction matters. [pause] A V W A P algorithm can help execute an investment decision. [pause] It does not answer whether the investment decision was good. [pause] Execution quality and market direction are different problems.",
"b13":" [pause] Both families sound mechanical because they are. [pause] But neither removes market risk. [pause] A spread is only useful after costs. [pause] A quote is only useful while information has not moved past it.",
"b14":" [pause] India-first means the operating details matter. [pause] A rule that works in a notebook still has to pass broker, identity, authentication, tagging, and monitoring requirements.",
"b15":" [pause] These are safeguards for traceability and accountability. [pause] They are not a scorecard for a strategy. [pause] Registration or an identifier does not certify a return. [pause] It makes orders easier to identify and supervise.",
"b16":" [pause] A robust test asks a tougher question. [pause] What happens if fills are worse than expected? [pause] What happens if the spread is wider? [pause] What happens if a small gross edge disappears after the complete cost stack?",
"b17":" [pause] The lesson is not that every trader will lose. [pause] The lesson is that broad retail F and O outcomes are harsh, and a claim of automation does not change that evidence. [pause] Treat every profit promise with special caution.",
"b18":" [pause] Now we turn the map into an operating checklist. [pause] The right order is deliberate: test first, limit risk, then observe what happens in the real environment.",
"b19":" [pause] Each hand-off should be observable. [pause] You should be able to answer: what data arrived, what signal fired, which check approved it, which order left, and which fill returned. [pause] If you cannot answer that, you cannot safely debug it.",
"b20":" [pause] A good backtest is a challenge to the idea, not a sales brochure. [pause] Change assumptions. [pause] Reserve unseen data. [pause] Stress costs. [pause] If the result survives only one narrow setting, it is fragile.",
"b21":" [pause] This is why risk code sits immediately before the order. [pause] The signal may be perfectly valid and still be unacceptable today because cash, margin, size, or loss limits say no. [pause] That is disciplined automation.",
"b22":" [pause] Paper trading checks workflow. [pause] Small live size checks execution. [pause] Neither step proves future profitability. [pause] They reduce the chance that a technical failure becomes a large financial mistake.",
"b23":" [pause] The common thread is humility. [pause] Markets change. [pause] Data fails. [pause] Costs compound. [pause] A system should be designed to survive uncertainty, not to advertise certainty.",
"b24":" [pause] Keep the scope labels attached to every number. [pause] Keep synthetic examples labelled. [pause] And keep the decision to stop as available as the decision to trade."
}
SEGMENTS=[(sid,typ,prop,text+DEPTH.get(sid,"")) for sid,typ,prop,text in SEGMENTS]
def wrap(s,w=52):
 out=[];cur=""
 for x in s.split():
  if len(cur)+len(x)+1>w and cur: out.append(cur);cur=x
  else: cur=(cur+" "+x).strip()
 return "\n".join((out+[cur])[:2])
def cues(text,d,t0):
 ps=text.split("[pause]"); pauses=len(ps)-1; words=sum(len(x.split()) for x in ps) or 1; each=max(0,d-pauses*PAUSE/ATEMPO)/words; now=0;out=[]
 for q,part in enumerate(ps):
  ws=part.split()
  for i in range(0,len(ws),9):
   z=ws[i:i+9]; dd=each*len(z);out.append([round(t0+now,3),round(t0+now+dd,3),wrap(" ".join(z))]);now+=dd
  if q<len(ps)-1: now+=PAUSE/ATEMPO
 return out
def concat(paths,out):
 sil=os.path.join(ROOT,"artifacts","gap.wav"); subprocess.run(["ffmpeg","-y","-f","lavfi","-i","anullsrc=r=24000:cl=mono","-t",str(GAP),sil],check=True,capture_output=True)
 f=os.path.join(ROOT,"artifacts","join.txt")
 with open(f,"w") as h:
  for i,x in enumerate(paths): h.write(f"file '{x}'\n"+(f"file '{sil}'\n" if i<len(paths)-1 else ""))
 subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i",f,"-c","copy",out],check=True,capture_output=True)
paths=[]; cuts=[]; allc=[]; t=0
for sid,typ,prop,text in SEGMENTS:
 path,d=gen(sid,text);paths.append(path);cuts.append({"id":sid,"type":typ,"in_seconds":round(t,3),"out_seconds":round(t+d,3),"props":{**prop,"dur":round(d+GAP,3)}});allc+=cues(text,d,t);print(f"{sid} {typ:16} {d:6.2f}s"+(" ⚠ LONG >90s" if d>90 else ""));t+=d+GAP
concat(paths,os.path.join(PUBLIC,"narration.wav")); master={"cuts":cuts,"captions":allc,"audio":{"narration":{"src":"dta/narration.wav","volume":1.0}}};json.dump(master,open(os.path.join(ROOT,"artifacts","edit_decisions.json"),"w"),indent=1)
for ci,idxs in enumerate(CHAPTERS,1):
 cc=[];qc=[];ct=0;pp=[]
 for i in idxs:
  s=SEGMENTS[i]; path=paths[i];d=dur(path);pp.append(path);cc.append({"id":s[0],"type":s[1],"in_seconds":round(ct,3),"out_seconds":round(ct+d,3),"props":{**s[2],"dur":round(d+GAP,3)}});qc+=cues(s[3],d,ct);ct+=d+GAP
 out=os.path.join(PUBLIC,f"ch{ci:02}.wav");concat(pp,out);json.dump({"cuts":cc,"captions":qc,"audio":{"narration":{"src":f"dta/ch{ci:02}.wav","volume":1.0}}},open(os.path.join(ROOT,"artifacts",f"edit_decisions_ch{ci:02}.json"),"w"),indent=1);print(f"CH{ci:02} {ct-GAP:.2f}s ({(ct-GAP)/60:.2f} min)")
print(f"TOTAL {t-GAP:.2f}s ({(t-GAP)/60:.2f} min) · {len(SEGMENTS)} scenes · {len(allc)} captions")
